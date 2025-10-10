const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { createHandler } = require('graphql-http/lib/use/express');
const { buildSchema } = require('graphql');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Helper: Sanitize input to prevent XSS
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return input.replace(/<[^>]*>/g, '');
}

// Mock users (add this after your existing code)
const users = [
    { username: 'admin', password: 'securepassword', role: 'admin' },
    { username: 'viewer', password: 'viewpass', role: 'viewer' }
];

// REST Login Route with Validation & Sanitization
app.post('/login', [
    body('username').isString().trim().escape(),
    body('password').isString().trim().escape()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const username = sanitizeInput(req.body.username);
    const password = sanitizeInput(req.body.password);

    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        const token = jwt.sign({ username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.json({ token, role: user.role });
    }
    return res.status(401).json({ error: 'Invalid credentials' });
});

// GraphQL Schema & Resolvers
const schema = buildSchema(`
    type BlockedIP {
        ip: String!
        reason: String
        timestamp: String
    }
    type WAFTrigger {
        id: ID!
        rule: String!
        severity: String!
        timestamp: String!
    }
    type DDoSEvent {
        id: ID!
        source: String!
        trafficVolume: Int!
        timestamp: String!
    }
    type User {
        username: String!
        role: String!
    }
    type Query {
        blockedIPs: [BlockedIP]
        wafTriggers: [WAFTrigger]
        ddosEvents: [DDoSEvent]
    }
    type Mutation {
        addBlockedIP(ip: String!, reason: String): BlockedIP
        addRule(rule: String!, severity: String!): WAFTrigger
    }
`);

// Mock data arrays
const blockedIPs = [
    { ip: "192.168.1.1", reason: "Brute force", timestamp: new Date().toISOString() },
    { ip: "10.0.0.2", reason: "SQL Injection", timestamp: new Date().toISOString() }
];

const wafTriggers = [
    { id: "1", rule: "XSS Filter", severity: "high", timestamp: new Date().toISOString() },
    { id: "2", rule: "SQLi Filter", severity: "medium", timestamp: new Date().toISOString() }
];

const ddosEvents = [
    { id: "1", source: "Botnet", trafficVolume: 100000, timestamp: new Date().toISOString() },
    { id: "2", source: "Unknown", trafficVolume: 50000, timestamp: new Date().toISOString() }
];

// Resolvers
const root = {
    blockedIPs: () => blockedIPs,
    wafTriggers: () => wafTriggers,
    ddosEvents: () => ddosEvents,
    addBlockedIP: ({ ip, reason }, context) => {
        if (!context.user || context.user.role !== 'admin') {
            throw new Error('Unauthorized');
        }
        const blocked = {
            ip: sanitizeInput(ip),
            reason: sanitizeInput(reason || "Unknown"),
            timestamp: new Date().toISOString()
        };
        blockedIPs.push(blocked);
        return blocked;
    },
    addRule: ({ rule, severity }, context) => {
        if (!context.user || context.user.role !== 'admin') {
            throw new Error('Unauthorized');
        }
        const newRule = {
            id: (wafTriggers.length + 1).toString(),
            rule: sanitizeInput(rule),
            severity: sanitizeInput(severity),
            timestamp: new Date().toISOString(),
        };
        wafTriggers.push(newRule);
        return newRule;
    }
};

// JWT Middleware for GraphQL
function getUserFromAuthHeader(req) {
    const auth = req.headers.authorization;
    if (auth) {
        try {
            const token = auth.split(' ')[1];
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (e) {
            return { role: 'viewer' };
        }
    }
    return { role: 'viewer' };
}

// GraphQL endpoint using graphql-http
app.all('/graphql', createHandler({
    schema,
    rootValue: root,
    context: async (req) => ({
        user: getUserFromAuthHeader(req)
    })
}));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
const API_BASE_URL = 'http://localhost:4000';

export const graphqlRequest = async (query) => {
    try {
        const response = await fetch(`${API_BASE_URL}/graphql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('jwt')}`
            },
            body: JSON.stringify({ query })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.errors) {
            throw new Error(data.errors[0].message);
        }

        return data.data;
    } catch (error) {
        console.error('GraphQL request failed:', error);
        throw error;
    }
};

export const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
};

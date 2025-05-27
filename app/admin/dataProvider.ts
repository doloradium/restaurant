import { DataProvider } from 'react-admin';

const apiUrl = '/api/admin';

export const dataProvider: DataProvider = {
    getList: async (resource) => {
        try {
            console.log(`Fetching list of ${resource}`);

            const response = await fetch(`${apiUrl}/${resource}`);

            if (!response.ok) {
                console.error(
                    `Error fetching ${resource} list:`,
                    response.status,
                    response.statusText
                );
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log(`${resource} list data:`, data);

            // Special handling for categories if needed
            if (resource === 'categories' && (!data || !Array.isArray(data))) {
                console.warn(
                    'Categories data is not an array, returning empty array'
                );
                return {
                    data: [],
                    total: 0,
                };
            }

            return {
                data: Array.isArray(data) ? data : [],
                total: Array.isArray(data) ? data.length : 0,
            };
        } catch (error) {
            console.error(`Error fetching ${resource} list:`, error);
            return {
                data: [],
                total: 0,
            };
        }
    },

    getOne: async (resource, params) => {
        try {
            console.log(`Fetching single ${resource} with ID:`, params.id);
            const response = await fetch(`${apiUrl}/${resource}/${params.id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log(`${resource} data:`, data);
            return { data };
        } catch (error) {
            console.error(`Error fetching ${resource}:`, error);
            throw error;
        }
    },

    getMany: async (resource, params) => {
        try {
            const response = await fetch(`${apiUrl}/${resource}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return {
                data: Array.isArray(data)
                    ? data.filter((item: any) => params.ids.includes(item.id))
                    : [],
            };
        } catch (error) {
            console.error('Error fetching many:', error);
            return { data: [] };
        }
    },

    getManyReference: async (resource, params) => {
        try {
            const response = await fetch(`${apiUrl}/${resource}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const filteredData = Array.isArray(data)
                ? data.filter((item: any) => item[params.target] === params.id)
                : [];
            return {
                data: filteredData,
                total: filteredData.length,
            };
        } catch (error) {
            console.error('Error fetching many reference:', error);
            return { data: [], total: 0 };
        }
    },

    create: async (resource, params) => {
        try {
            const response = await fetch(`${apiUrl}/${resource}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params.data),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return { data };
        } catch (error) {
            console.error('Error creating:', error);
            throw error;
        }
    },

    update: async (resource, params) => {
        try {
            console.log('Updating resource:', resource, 'with params:', params);

            const response = await fetch(`${apiUrl}/${resource}/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params.data),
            });

            if (!response.ok) {
                const errorData = await response
                    .json()
                    .catch(() => ({ error: 'Unknown error' }));
                console.error('Update error response:', errorData);
                throw new Error(
                    errorData.error || `HTTP error! status: ${response.status}`
                );
            }

            const data = await response.json();
            console.log('Update success response:', data);
            return { data };
        } catch (error) {
            console.error('Error updating resource:', error);
            throw error;
        }
    },

    updateMany: async (resource, params) => {
        try {
            const responses = await Promise.all(
                params.ids.map((id) =>
                    fetch(`${apiUrl}/${resource}/${id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(params.data),
                    })
                )
            );
            const data = await Promise.all(responses.map((r) => r.json()));
            return { data: params.ids };
        } catch (error) {
            console.error('Error updating many:', error);
            throw error;
        }
    },

    delete: async (resource, params) => {
        try {
            const response = await fetch(`${apiUrl}/${resource}/${params.id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return { data: params.previousData as any };
        } catch (error) {
            console.error('Error deleting:', error);
            throw error;
        }
    },

    deleteMany: async (resource, params) => {
        try {
            await Promise.all(
                params.ids.map((id) =>
                    fetch(`${apiUrl}/${resource}/${id}`, {
                        method: 'DELETE',
                    })
                )
            );
            return { data: params.ids };
        } catch (error) {
            console.error('Error deleting many:', error);
            throw error;
        }
    },
};

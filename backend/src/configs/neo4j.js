import neo4j from 'neo4j-driver';

const uri = process.env.NEO4J_URI;
const user = process.env.NEO4J_USERNAME;
const password = process.env.NEO4J_PASSWORD;
const defaultDatabase = process.env.NEO4J_DATABASE;

const driver =
    uri && user && password
        ? neo4j.driver(uri, neo4j.auth.basic(user, password), {
              maxConnectionPoolSize: 50,
              connectionTimeout: 10000,
          })
        : null;

export const getNeo4jSession = (database = defaultDatabase) => {
    if (!driver) {
        throw new Error('Neo4j driver is not configured.');
    }
    return driver.session({ database });
};

export const initNeo4j = async () => {
    if (!driver) {
        return { success: false, message: 'Neo4j driver not configured' };
    }
    const session = getNeo4jSession();
    try {
        await session.run(`
            CREATE CONSTRAINT user_id_unique IF NOT EXISTS
            FOR (u:User) REQUIRE u.id IS UNIQUE
        `);
        return { success: true };
    } catch (err) {
        console.error('Failed to initialize Neo4j constraint:', err.message);
        return { success: false, error: err };
    } finally {
        await session.close();
    }
};

export const closeNeo4j = async () => {
    if (driver) {
        await driver.close();
    }
};

export default driver;

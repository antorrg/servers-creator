
export const drizzle=  {
        part1:`+ Drizzle`,
        part2:`**Drizzle v0 (PostgreSQL)**`,
        part3: `Database Models (./schema/schema.prisma):

Explicit drizzle-orm V0.45.3 models mapped cleanly to PostgreSQL tables.`,
        part4: `
        
#### Database Connection (database.ts)

Manages Drizzle initialization, and startup synchronization.`,

        part5: `
│   └── schemas/                # Schemas from drizzle
│   └── shared/                 # Shared functions, repositories, utilities & dependencies
├── drizzle.config.ts            # drizzle setup
├── .env                        # Development environment for drizzle database url`,
        part6:`
### Initialize drizzle

The schemas come pre-configured, (src/schemas) though you can modify or add tables, columns, and rows.
In the API, the schemas are organized individually and then imported/exported in the \`index.schemas.ts\` file. This is not mandatory; you can approach it differently—for example, by using a single \`schemas\` file—provided that you correctly specify the path and name in \`drizzle.config.ts\`.
You must initialize the database using the commands **\`drizzle-kit migrate\`** and then **\`drizzle-kit generate\`**, as shown in the examples below. Pay special attention to ensure that the database being initialized is the one specified in the \`.env\` file.
When running migrations and generation, Drizzle relies solely on the \`.env\` environment variable; other variables will be read from their respective files once the project is initialized. Therefore, upon starting, you must run a migration and a generation for each database by manually loading its URL into the \`.env\` file. This approach ensures that Drizzle's default behavior remains unaltered.
Examples 

\`\`\`bash
- npx drizzle-kit generate

- npx drizzle-kit migrate
\`\`\`
`,

    }
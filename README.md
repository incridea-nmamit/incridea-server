## Incridea Server repo

### Tech Stack

![Backend](https://user-images.githubusercontent.com/62538932/217338220-7b2a5832-6072-4839-a85d-0df1b37cee0e.png)

### Docs

- [**GraphQL Yoga**](https://the-guild.dev/graphql/yoga-server/docs/)
- [**Typescript**](https://www.typescriptlang.org/docs/)
- [**Prisma**](https://www.prisma.io/docs/)
- [**Pothos**](https://pothos-graphql.dev/docs/guide/)

### Local setup

1. Clone the repository

```bash
git clone https://github.com/incridea-nmamit/incridea-server.git
```

2. Install all dependencies

```bash
npm install
```

3. Generate Prisma Clinet

```bash
npx prisma generate
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

> to open graphQl playground visit [http://localhost:4000/graphql](http://localhost:4000/graphql) .

### Branching and Making PRs

1. After cloning and setting up the environment, checkout to a new branch (name is related to your task, for eg: feat/get-events, fix/email-verification)

```bash
git checkout -b ＜branch_name＞
```

2. Make the required changes according to your task.

```bash
//Staging changes
git add .
//Commiting changes
git commit -m <short message about task>
//Pushing changes
git push origin <branch_name>
```

3. Make a Pull request to main branch, and wait for it to get reviewed by someone in the team. If there are review comments, make a new commit making those changes to the same branch to address those comments.

> **Note**
> Use [semantic commit messages](https://gist.github.com/joshbuchea/6f47e86d2510bce28f8e7f42ae84c716) to keep the commit history clean.

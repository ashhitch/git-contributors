import React, { useEffect, useState } from 'react';
import {  Text, Box } from 'ink';
import  nodegit from '@figma/nodegit';
import  path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function listContributorsByMonth(repoPath: string) {
  const repositoryPath = path.resolve(__dirname, repoPath);
  const currentDate = new Date();
  const newMonths: { month: string; contributors: string[] }[] = [];

  for (let i = 0; i < 12; i++) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);

    const repo = await nodegit.Repository.open(repositoryPath);
    const references = await repo.getReferenceNames(nodegit.Reference.TYPE.ALL);

    const contributors = new Set<string>();

    for (const reference of references) {
      if (reference.startsWith('refs/heads/') || reference.startsWith('refs/tags/')) {
        const commit = await repo.getReferenceCommit(reference);
        const commitHistory = commit.history();

        commitHistory.on('commit', async (commit: nodegit.Commit) => {
          const commitDate = commit.date();

          if (commitDate >= startOfMonth && commitDate <= endOfMonth) {
            contributors.add(commit.author().name());
          }
        });

        await new Promise<void>((resolve, reject) => {
          commitHistory.on('end', () => {
            resolve();
          });

          commitHistory.on('error', (err: Error) => {
            reject(err);
          });

          commitHistory.start();
        });
      }
    }

    newMonths.push({
      month: startOfMonth.toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
      contributors: Array.from(contributors),
    });

    currentDate.setMonth(currentDate.getMonth() - 1);
  }

  return newMonths;
}
export default function ContributorList({ repoPath }: { repoPath: string }) {
	const [months, setMonths] = useState<{ month: string; contributors: string[] }[]>([]);

  useEffect(() => {
    listContributorsByMonth(repoPath)
      .then(data => {
        setMonths(data);
      })
      .catch(error => {
        console.error(`Error: ${error.message}`);
      });
  }, [repoPath]);






  return (
    <Box flexDirection="column">
      {months.map((monthData, index) => (
        <Box key={index}>
          <Text bold color="green">{monthData.month} ({monthData.contributors.length}):</Text>
          <Box marginLeft={2}>
            <Text>{monthData.contributors.join(', ')}</Text>
          </Box>
        </Box>
      ))}
    </Box>
  );
}


//render(<ContributorList repoPath={cli.flags.repo} />);

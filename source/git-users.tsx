import React, { useEffect, useState } from 'react';
import {  Text, Box } from 'ink';
import  nodegit from 'nodegit';
import  path from 'path';



export default function ContributorList({ repoPath }: { repoPath: string }) {
  const [months, setMonths] = useState<{ month: string; contributors: string[] }[]>([]);

  useEffect(() => {
    const repositoryPath = path.resolve(__dirname, repoPath);
    const currentDate = new Date();
    const fetchMonths = async () => {
      const newMonths: { month: string; contributors: string[] }[] = [];

      for (let i = 0; i < 12; i++) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const startOfMonth = new Date(year, month - 1, 1);
        const prevMonth = month === 1 ? 12 : month - 1;
        const prevYear = month === 1 ? year - 1 : year;
        const lastDayPrevMonth = new Date(prevYear, prevMonth, 0).getDate();
        const endOfPrevMonth = new Date(prevYear, prevMonth - 1, lastDayPrevMonth);

        const contributors = await getContributors(repositoryPath, startOfMonth, endOfPrevMonth);

        newMonths.push({
          month: startOfMonth.toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
          contributors: contributors.map(contributor => contributor.author().name()),
        });

        currentDate.setMonth(currentDate.getMonth() - 1);
      }

      setMonths(newMonths);
    };

    fetchMonths();
  }, [repoPath]);

  async function getContributors(repositoryPath: string, startDate: Date, endDate: Date) {
    const repo = await nodegit.Repository.open(repositoryPath);
    const contributors = await repo.getMetricsBetween(startDate, endDate);

    return contributors;
  }

  return (
    <Box flexDirection="column">
      {months.map((monthData, index) => (
        <Box key={index}>
          <Text bold>{monthData.month}:</Text>
          <Box marginLeft={2}>
            {monthData.contributors.join(', ')}
          </Box>
        </Box>
      ))}
    </Box>
  );
}


//render(<ContributorList repoPath={cli.flags.repo} />);

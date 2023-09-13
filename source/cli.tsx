#!/usr/bin/env node
import React from 'react';
import {render} from 'ink';
import meow from 'meow';


import ContributorList from './git-users.js';

const cli = meow(`
  Usage
    $ node cli_contributors.ts --repo <repository-path>

  Options
    --repo, -r  Path to the Git repository
`, {
	importMeta: import.meta,
  flags: {
    repo: {
      type: 'string',
      alias: 'r',
      isRequired: true,
    },
  },
});



render(<ContributorList repoPath={cli.flags.repo} />);

/*
 * Copyright 2024 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {
  Content,
  ContentHeader,
  EmptyState,
  InfoCard,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import React from 'react';
import { DeploymentConfig, DeploymentConfigList } from '../../types';
import useAsync from 'react-use/esm/useAsync';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Theme,
  makeStyles,
} from '@material-ui/core';

const useInstancesStyles = makeStyles((theme: Theme) => ({
  podsTableCell: {
    width: theme.spacing(20),
  },
}));

type InstancesTableProps = {
  deploymentConfigs?: DeploymentConfig[];
};

export const InstancesTable = ({ deploymentConfigs }: InstancesTableProps) => {
  const classes = useInstancesStyles();

  if (!deploymentConfigs || deploymentConfigs.length === 0) {
    return (
      <EmptyState
        missing="data"
        title="No instances to show"
        description="Create instances based on a selected template."
      />
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableBody>
          {deploymentConfigs.map(deploymentConfig => (
            <TableRow key={deploymentConfig.metadata.name}>
              <TableCell component="th" scope="row">
                {deploymentConfig.metadata.name}
              </TableCell>
              <TableCell className={classes.podsTableCell}>
                {`${deploymentConfig.status.readyReplicas ?? 0} of ${
                  deploymentConfig.status.replicas ?? 0
                } Pod${deploymentConfig.status.replicas !== 1 ? 's' : ''}`}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export const Instances = () => {
  const config = useApi(configApiRef);
  const namespace = 'default'; // TODO: More logic might need to be implemented here.

  const { value, error, loading } =
    useAsync(async (): Promise<DeploymentConfigList> => {
      const response = await fetch(
        `${config.getString(
          'backend.baseUrl',
        )}/api/catalog-info/deploymentconfigs/${namespace}`,
      );

      return response.json();
    }, []);

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  return (
    <Content>
      <ContentHeader title="Instances" />
      <InstancesTable deploymentConfigs={value?.items} />
    </Content>
  );
};

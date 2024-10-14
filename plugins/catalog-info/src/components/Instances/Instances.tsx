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
  InfoCard,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import React from 'react';
import { DeploymentConfigList } from '../../types';
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

export const Instances = () => {
  const config = useApi(configApiRef);
  const namespace = 'default'; // TODO: More logic might need to be implemented here.
  const classes = useInstancesStyles();

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
      <TableContainer component={Paper}>
        <Table>
          <TableBody>
            {value!.items.map(deploymentConfig => (
              <TableRow key={deploymentConfig.metadata.name}>
                <TableCell component="th" scope="row">
                  {deploymentConfig.metadata.name}
                </TableCell>
                <TableCell className={classes.podsTableCell}>
                  {`${deploymentConfig.status.readyReplicas} of ${
                    deploymentConfig.status.replicas
                  } Pod${deploymentConfig.status.replicas > 1 ? 's' : ''}`}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Content>
  );
};

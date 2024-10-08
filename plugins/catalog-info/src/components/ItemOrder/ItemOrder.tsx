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
import React from 'react';
import {
  Content,
  ContentHeader,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { itemOrderSubRouteRef, templatesSubRouteRef } from '../../routes';
import {
  configApiRef,
  useApi,
  useRouteRef,
  useRouteRefParams,
} from '@backstage/core-plugin-api';
import { Template } from '../../types';
import useAsync from 'react-use/esm/useAsync';
import {
  Box,
  Button,
  FormControl,
  TextField,
  Theme,
  makeStyles,
} from '@material-ui/core';
import Stack from '@mui/material/Stack';
import { useNavigate } from 'react-router-dom';

const useItemOrderStyles = makeStyles((theme: Theme) => ({
  formControl: {
    transition: 'width 0.3s ease-in-out',
    width: theme.spacing(100),
    maxWidth: theme.spacing(100),

    [theme.breakpoints.down('md')]: {
      width: '100%',
      maxWidth: theme.spacing(100),
    },
  },
}));

export const ItemOrder = () => {
  const classes = useItemOrderStyles();
  const config = useApi(configApiRef);
  const { namespace, name } = useRouteRefParams(itemOrderSubRouteRef);
  const navigate = useNavigate();
  const templatesRoute = useRouteRef(templatesSubRouteRef)();

  // TODO: Explore caching options when user is redirected from the template list to the order page.
  // All the data should be already available in such case.
  const { value, loading, error } = useAsync(async (): Promise<Template> => {
    const response = await fetch(
      `${config.getString(
        'backend.baseUrl',
      )}/api/catalog-info/templates/${namespace}/${name}`,
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
      <ContentHeader
        title={`Order ${value?.metadata.annotations['openshift.io/display-name']}`}
      />
      <Stack spacing={2}>
        {value?.parameters.map(parameter => {
          return (
            <FormControl classes={{ root: classes.formControl }}>
              <TextField
                id={parameter.name.toString()}
                size="small"
                variant="outlined"
                label={
                  parameter.displayName
                    ? parameter.displayName.toString()
                    : parameter.name.toString()
                }
                defaultValue={parameter.value}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </FormControl>
          );
        })}
        <Stack spacing={2} direction="row">
          <Button variant="contained">Order</Button>
          <Button
            variant="outlined"
            onClick={() => {
              if (window.history.state?.idx !== 0) {
                navigate(-1);
              } else {
                navigate(templatesRoute);
              }
            }}
          >
            Cancel
          </Button>
        </Stack>
      </Stack>
    </Content>
  );
};

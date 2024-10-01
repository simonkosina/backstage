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
import React, { useState } from 'react';
import {
  Progress,
  ResponseErrorPanel,
  ItemCardGrid,
  ItemCardHeader,
} from '@backstage/core-components';
import useAsync from 'react-use/lib/useAsync';
// FIXME: Sharing types between backend and frontend plugins? Project structure?
import { Template, TemplateListSchema } from '../../types';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Theme,
  Typography,
  makeStyles,
} from '@material-ui/core';
import Close from '@material-ui/icons/Close';
import defaultImage from '../../../assets/default.png';

type TemplateCardsProps = {
  templates: Template[];
  onCardClick: (index: number) => void;
};

type TemplateDrawerContentProps = {
  template: Template;
  onCloseClick: () => void;
};

// FIXME: Research styling practices in backstage/material UI
const useTemplateCardsStyles = makeStyles((theme: Theme) => ({
  cardActionArea: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  cardContent: {
    width: '100%',
  },
  headerBox: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
  },
  headerLogo: {
    width: theme.spacing(7),
  },
  headerChip: {},
}));

const useTemplateDrawerContentStyles = makeStyles((theme: Theme) => ({
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  buttons: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: theme.spacing(2.5),
    marginBottom: theme.spacing(2.5),
  },
  createButton: {
    width: theme.spacing(10),
  },
  templateLogo: {
    marginRight: theme.spacing(2.5),
    width: theme.spacing(10),
  },
  iconButton: {
    height: 'fit-content',
    width: 'fit-conent',
  },
  closeIcon: {
    fontSize: 20,
  },
}));

const useTemplateDrawerStyles = makeStyles((theme: Theme) => ({
  paper: {
    width: '50%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    padding: theme.spacing(2.5),
  },
}));

export const TemplateCards = ({
  templates,
  onCardClick,
}: TemplateCardsProps) => {
  const classes = useTemplateCardsStyles();

  return (
    <ItemCardGrid>
      {templates.map((template, index) => (
        <Card key={index}>
          <CardActionArea
            classes={{ root: classes.cardActionArea }}
            onClick={_ => {
              onCardClick(index);
            }}
          >
            <CardContent classes={{ root: classes.cardContent }}>
              <Box className={classes.headerBox}>
                <img
                  src={defaultImage}
                  alt={
                    template.metadata.annotations['openshift.io/display-name']
                  }
                  className={classes.headerLogo}
                />
                <Chip label="Label" />
              </Box>
              <Typography variant="body1">
                {template.metadata.annotations[
                  'openshift.io/display-name'
                ].trim()}
              </Typography>
              {template.metadata.annotations[
                'openshift.io/provider-display-name'
              ]?.trim() && (
                <Typography variant="caption">
                  {`Provided by ${template.metadata.annotations[
                    'openshift.io/provider-display-name'
                  ].trim()}`}
                </Typography>
              )}
              <Typography variant="body2">
                {template.metadata.annotations.description.trim()}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      ))}
    </ItemCardGrid>
  );
};

export const TemplateDrawerContent = ({
  template,
  onCloseClick,
}: TemplateDrawerContentProps) => {
  const classes = useTemplateDrawerContentStyles();

  return (
    <>
      <div className={classes.header}>
        <div className={classes.headerTitle}>
          <img
            src={defaultImage}
            alt={template.metadata.annotations['openshift.io/display-name']}
            className={classes.templateLogo}
          />
          <Typography variant="h5">
            {template.metadata.annotations['openshift.io/display-name']}
          </Typography>
        </div>
        <div className={classes.iconButton}>
          <IconButton
            key="dismiss"
            title="Close the drawer"
            onClick={onCloseClick}
          >
            <Close className={classes.closeIcon} />
          </IconButton>
        </div>
      </div>
      <div className={classes.buttons}>
        <Button variant="contained">Create</Button>
      </div>
      <Divider />
    </>
  );
};

export const ExampleFetchComponent = () => {
  const config = useApi(configApiRef);
  const classes = useTemplateDrawerStyles();
  const [drawerIsOpen, toggleDrawer] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { value, loading, error } =
    useAsync(async (): Promise<TemplateListSchema> => {
      const response = await fetch(
        `${config.getString('backend.baseUrl')}/api/catalog-info/templates`,
      );
      return response.json();
    }, []);

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  // FIXME: Erorr handling in value.items indexing
  return (
    <>
      <TemplateCards
        templates={value.items || []}
        onCardClick={(index: number) => {
          setSelectedIndex(index);
          toggleDrawer(true);
        }}
      />
      <Drawer
        anchor="right"
        open={drawerIsOpen}
        onClose={() => toggleDrawer(false)}
        classes={{
          paper: classes.paper,
        }}
      >
        <TemplateDrawerContent
          template={value.items[selectedIndex]}
          onCloseClick={() => toggleDrawer(false)}
        />
      </Drawer>
    </>
  );
};

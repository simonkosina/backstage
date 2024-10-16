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
  Content,
  ContentHeader,
  Progress,
  ResponseErrorPanel,
  ItemCardGrid,
  LinkButton,
  EmptyState,
} from '@backstage/core-components';
import useAsync from 'react-use/lib/useAsync';
import { Template, TemplateList } from '../../types';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Link,
  Theme,
  Typography,
  makeStyles,
  useMediaQuery,
  useTheme,
} from '@material-ui/core';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import Close from '@material-ui/icons/Close';
import defaultImage from '../../../assets/default.png';
import { templateInstantiationSubRouteRef } from '../../routes';
import { useRouteRef } from '@backstage/core-plugin-api';

type TemplateCardsProps = {
  templates?: Template[];
  onCardClick: (index: number) => void;
};

type TemplateDrawerContentProps = {
  template: Template;
  onCloseClick: () => void;
};

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
    marginBottom: theme.spacing(1),
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
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  contentBox: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',

    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column-reverse',
    },
  },
  contentDescription: {
    flexGrow: 1,

    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
  contentLabels: {
    flexShrink: 0,
    width: theme.spacing(20),

    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
  labelDiv: {
    marginBottom: theme.spacing(1),
  },
}));

const useTemplateDrawerStyles = makeStyles((theme: Theme) => ({
  paper: {
    width: '50%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    padding: theme.spacing(2.5),
    transition: 'width 0.3s ease-in-out', // Add smooth transition for width changes

    [theme.breakpoints.down('lg')]: {
      width: '65%',
    },

    [theme.breakpoints.down('md')]: {
      width: '80%',
    },

    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
}));

export const TemplateCards = ({
  templates,
  onCardClick,
}: TemplateCardsProps) => {
  const classes = useTemplateCardsStyles();

  if (!templates || templates.length === 0) {
    return (
      <EmptyState
        missing="data"
        title="No templates to show"
        description="If the issue persists, please contact our team."
      />
    );
  }

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
              <Typography variant="body1" style={{ fontWeight: 'bold' }}>
                {template.metadata.annotations['openshift.io/display-name']}
              </Typography>
              {template.metadata.annotations[
                'openshift.io/provider-display-name'
              ]?.trim() && (
                  <Typography variant="caption">
                    {`Provided by ${template.metadata.annotations['openshift.io/provider-display-name']}`}
                  </Typography>
                )}
              <Typography variant="body2">
                {template.metadata.annotations.description}
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
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const templateInstantiationRoute = useRouteRef(templateInstantiationSubRouteRef);

  const labels = {
    'Created at': (
      <Typography variant="body2">
        {new Date(template.metadata.creationTimestamp).toLocaleString()}
      </Typography>
    ),
    Support: (
      <Link
        variant="body2"
        target="_blank"
        rel="noopener noreferrer"
        href={template.metadata.annotations['openshift.io/support-url']}
      >
        Get Support <OpenInNewIcon fontSize="inherit" />
      </Link>
    ),
    Documentation: (
      <Link
        variant="body2"
        target="_blank"
        rel="noopener noreferrer"
        href={template.metadata.annotations['openshift.io/documentation-url']}
      >
        Refer Documentation <OpenInNewIcon fontSize="inherit" />
      </Link>
    ),
  };

  // TODO: Demo Platform seems to be rendering HTML elements in the catalog item description.
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
        <LinkButton
          variant="contained"
          to={templateInstantiationRoute({
            namespace: template.metadata.namespace,
            name: template.metadata.name,
          })}
        >
          Create
        </LinkButton>
      </div>
      <Divider className={classes.divider} />
      <Box className={classes.contentBox}>
        <Box className={classes.contentLabels}>
          {Object.entries(labels).map(([key, value]) => (
            <div className={classes.labelDiv}>
              <Typography variant="body2" style={{ fontWeight: 'bold' }}>
                {key}
              </Typography>
              {value}
            </div>
          ))}
        </Box>
        {isSmallScreen && <Divider className={classes.divider} />}
        <Box className={classes.contentDescription}>
          <Typography variant="h4">Description</Typography>
          <Typography variant="body2">
            {template.metadata.annotations.description}
          </Typography>
        </Box>
      </Box>
    </>
  );
};

export const Templates = () => {
  const config = useApi(configApiRef);
  const classes = useTemplateDrawerStyles();
  const [drawerIsOpen, toggleDrawer] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { value, loading, error } =
    useAsync(async (): Promise<TemplateList> => {
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

  return (
    <Content>
      <ContentHeader title="Template List" />
      <TemplateCards
        templates={value?.items}
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
        {value?.items?.[selectedIndex] && (
          <TemplateDrawerContent
            template={value.items[selectedIndex]}
            onCloseClick={() => toggleDrawer(false)}
          />
        )}
      </Drawer>
    </Content>
  );
};

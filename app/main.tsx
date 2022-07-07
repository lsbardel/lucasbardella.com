import { CmsRoute } from "@metablock/cms";
import { assetUrl, getBlock } from "@metablock/core";
import { Header, Link, List, useGa } from "@metablock/react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import React from "react";
import { Route, Routes } from "react-router-dom";
import blog from "../content/blog/collection.json";
import lab from "../content/lab/collection.json";
import pages from "../content/pages/collection.json";
import { BlogList, LabList } from "./views/CmsList";
import CmsPageEntry from "./views/CmsPageEntry";
import Footer from "./views/Footer";
const links: any[] = [
  {
    text: "cv",
    to: "/cv",
  },
  {
    text: "blog",
    to: "/blog",
  },
  {
    text: "lab",
    to: "/lab",
  },
];

const RightLinks = () => <List direction="horizontal" align="right" items={links} />;

const BrandComponent = () => {
  const theme = useTheme();
  return (
    <Link to="/">
      <Avatar
        src={assetUrl("luca-avatar.jpg")}
        alt="Luca"
        sx={{
          width: theme.spacing(7),
          height: theme.spacing(7),
        }}
      />
    </Link>
  );
};

const Main = () => {
  const theme = useTheme();
  const block = getBlock();
  useGa(block.plugins.ga?.id);
  return (
    <>
      <Header
        BrandComponent={BrandComponent}
        RightLinks={RightLinks}
        paddingTop={1}
        paddingBottom={1}
        maxWidth="md"
      />
      <Box bgcolor={theme.palette.background.paper}>
        <Routes>
          <Route
            path="/blog/*"
            element={
              <CmsRoute
                topic="blog"
                slug={blog.slug}
                ListComponent={BlogList}
                EntryComponent={CmsPageEntry}
              />
            }
          />
          <Route
            path="/lab/*"
            element={
              <CmsRoute
                topic="lab"
                slug={lab.slug}
                ListComponent={LabList}
                EntryComponent={CmsPageEntry}
              />
            }
          />
          <Route
            path="*"
            element={
              <CmsRoute
                topic="pages"
                slug={pages.slug}
                ListComponent={false}
                EntryComponent={CmsPageEntry}
              />
            }
          />
        </Routes>
      </Box>
      <Footer />
    </>
  );
};

export default Main;

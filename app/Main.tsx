import { CmsRoute } from "@metablock/cms";
import { assetUrl, getBlock } from "@metablock/core";
import { Header, Link, List, NoSsr, useGa } from "@metablock/react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, useTheme } from "@mui/material/styles";
import React from "react";
import { Route, Routes } from "react-router-dom";
import { useSessionStorage } from "react-use";
import blog from "../content/blog/collection.json";
import lab from "../content/lab/collection.json";
import pages from "../content/pages/collection.json";
import MUISwitch from "./MUISwitch";
import { darkTheme, lightTheme } from "./theme";
import { BlogList, LabList } from "./Views/CmsList";
import CmsPageEntry from "./Views/CmsPageEntry";
import Footer from "./Views/Footer";

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
  const [mode, setMode] = useSessionStorage("lucasbardella-mode", "dark");
  const theme = mode === "dark" ? darkTheme : lightTheme;
  const block = getBlock();
  useGa(block.plugins.ga?.id);

  const RightLinks = () => {
    const props = mode === "dark" ? { defaultChecked: true } : {};
    const switchTheme = (event: any) => {
      setMode(event.target.checked ? "dark" : "light");
    };
    return (
      <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "flex-end" }}>
        <MUISwitch sx={{ display: "flex" }} {...props} onChange={switchTheme} />
        <List direction="horizontal" align="right" underline="hover" items={links} />
      </Box>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NoSsr>
        <Header
          BrandComponent={BrandComponent}
          RightLinks={RightLinks}
          paddingTop={1}
          paddingBottom={1}
          maxWidth="md"
          hideSize="sm"
        />
      </NoSsr>
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
    </ThemeProvider>
  );
};

export default Main;

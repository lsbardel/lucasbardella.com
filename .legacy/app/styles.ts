import { createStyles, makeStyles, Theme } from "@mui/material/styles";

export default makeStyles((theme: Theme) => {
  const p = theme.palette;
  const dark = p.mode === "dark";

  return createStyles({
    root: {
      backgroundColor: dark ? p.secondary.dark : p.secondary.main,
      borderTop: `1px solid ${dark ? p.secondary.main : p.secondary.dark}`,
      left: 0,
      right: 0,
      position: "absolute",
    },
    container: {
      marginTop: theme.spacing(15),
      marginBottom: theme.spacing(15),
      display: "flex",
    },
    icon: {
      width: 48,
      height: 48,
      display: "flex",
    },
    icons: {},
    iconsWrapper: {
      height: 120,
    },
    list: {},
    listItem: {
      padding: 0,
    },
    avatarSmall: {
      width: theme.spacing(3),
      height: theme.spacing(3),
    },
    avatarLarge: {
      width: theme.spacing(7),
      height: theme.spacing(7),
    },
  });
});

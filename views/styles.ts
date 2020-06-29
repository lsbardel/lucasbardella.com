import { createStyles, makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(() => {
  return createStyles({
    parallax: {
      position: "relative",
      height: "90vh",
      maxHeight: "1000px",
      overflow: "hidden",
      margin: "0",
      padding: "0",
      border: "0",
      display: "flex",
      alignItems: "center",
      "& img.image": {
        zIndex: 1,
        backgroundPosition: "center center",
        width: "100%",
        objectFit: "cover",
      },
    },
    over: {
      zIndex: 2,
      content: "''",
      backgroundColor: (props: any) => `rgba(0, 0, 0, ${props.filter || 0.5})`,
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      right: 0,
      width: "100%",
      height: "100%",
    },
    main: {
      zIndex: 10,
    },
    small: {
      maxHeight: "380px",
    },
  });
});

export default useStyles;

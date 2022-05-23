import Home from "@mui/icons-material/Home";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import { ReactElement } from "react";

interface ToolBarProps {
    handleClick: () => void
}

function ToolBar(props: ToolBarProps): ReactElement {

    return <>
        <Grid container
            direction="row"
            justifyContent="center"
            alignItems="flex-end">
            <IconButton onClick={props.handleClick} size="large" style={{ background: "#FFF" }} >
                <Home color="secondary" />
            </IconButton>
        </Grid>

    </>;

}

export { ToolBar, type ToolBarProps };
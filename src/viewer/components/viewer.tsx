import { ReactElement } from "react";

interface ViewerProps {
    id?: string;
}

function Viewer(props: ViewerProps): ReactElement {

    return (
        <canvas width={window.innerWidth} height={window.innerHeight} style={{
            backgroundImage: "linear-gradient(to right, #2193b0, #6dd5ed)"
        }} id={props.id ?? "viewer"} ></canvas>
    );

}

export { Viewer };
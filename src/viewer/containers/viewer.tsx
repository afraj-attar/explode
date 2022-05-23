import { ReactElement, useEffect, useRef } from "react";
import { ThreeDViewer } from "../../ThreeDViewer";
import { ToolBar } from "../../ToolBar";
import { Viewer as ViewerComponent } from "../components/viewer";


export function Viewer(props: any): ReactElement {

    const threeDViewer = useRef<ThreeDViewer | undefined>();

    const handleHomeButtonClick = (): void => {

        threeDViewer.current && threeDViewer.current.fitToView();
    };

    useEffect(() => {
        threeDViewer.current = new ThreeDViewer(props.canvasId);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <>
        <ViewerComponent id={props.canvasId} />
        <ToolBar handleClick={handleHomeButtonClick} />
    </>;

}
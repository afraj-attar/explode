import { ReactElement } from "react";
import { ToolBar as ToolBarComponent, ToolBarProps } from "../components/toolBar";


function ToolBar(props: ToolBarProps): ReactElement {

    return <div style={{ bottom: "20px", left: 0, right: 0, position: 'absolute' }} >
        <ToolBarComponent handleClick={props.handleClick}></ToolBarComponent>
    </div>;
}

export { ToolBar };
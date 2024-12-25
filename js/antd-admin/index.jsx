import React, {useEffect, useRef} from "react";
import ImportGrid from "./ImportGrid.jsx";
import "./grid-import.css";

export default function (props) {
    const defaultOpt = {
        submitUrl: '',
        async: false,
        asyncProcessNotify: '',
        successRedirectUrl: '',
        data: null,
        exportErrObj: {output: false}
    };
    Object.assign(defaultOpt, props)

    const gridRef = useRef();

    useEffect(() => {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key == 'q') {
                gridRef.current.focusErr();
            }
        });
    }, [])

    return <ImportGrid ref={gridRef} submitUrl={defaultOpt.submitUrl} redirect={defaultOpt.successRedirectUrl}
                       data={defaultOpt.data} async={defaultOpt.async}
                       asyncProcessNotify={defaultOpt.asyncProcessNotify}
                       exportErrObj={defaultOpt.exportErrObj}
    />
}
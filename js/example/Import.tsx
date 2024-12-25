import React, {Suspense, useEffect, useState} from "react"
import {Button, Card, Space, Steps} from "antd";
import {router} from "@inertiajs/react";
import container from "@quansitech/antd-admin/dist/lib/container";

declare global {
    interface Window {
        IMPORT_PROMISE: Promise<any>
        importGrid: any
    }
}

interface ImportProps {
    step: 0 | 1 | 2,
    templateUrl: string,

    gridData: any,
    importAddUrl: string,
    importSuccessUrl: string,
    asyncProcessNotify?: string;
    async?: boolean;
}

export default function (props: ImportProps) {
    if (typeof window === 'undefined') {
        return <>
        </>
    }

    const [GridImport, setGridImport] = useState<any>(null)
    const [gridOpt, setGridOpt] = useState<any>({})

    const onDownloadClick = () => {
        const a = document.createElement('a')
        a.href = props.templateUrl
        a.click()
    }
    const onUploadClick = () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.xlsx,.xls'
        input.onchange = (e) => {
            if (input.files?.length) {
                router.post('', {
                    file: input.files[0]
                })
            }
        }
        input.click()
    }

    useEffect(() => {
        if (props.step == 1) {
            setGridImport(container.get('GridImport'))
            setGridOpt({
                submitUrl: props.importAddUrl, //设置数据提交到的后端地址
                successRedirectUrl: props.importSuccessUrl, //这里设置导入成功后，点击确定按钮要跳转到的地址
                data: props.gridData //将上面生成的grid_data转成json格式赋给data,

                // ----异步导入配置----
                // async: true, //是否异步导入
                // asyncProcessNotify: props.asyncProcessNotify || '', //进度请求地址

                // ----导出错误信息配置----
                // exportErrObj: {
                //     filename:"xxx错误信息.xlsx",// 导出文件名，默认为 错误信息.xlsx
                //     output: true, // 是否支持导出excel错误信息
                // },
            })
        }
    }, [props.step, props.gridData])

    return <>
        <Space direction={"vertical"} style={{width: '100%'}}>
            <Card>
                <Steps current={props.step} items={[
                    {title: '下载模板'},
                    {title: '导入数据'},
                ]}></Steps>
            </Card>
            {props.step === 0 && <>
                <Card type={"inner"} actions={[
                    <Button type={"primary"} onClick={onDownloadClick}>下载模板</Button>,
                    <Button onClick={onUploadClick}>上传</Button>
                ]}>
                    <ol>
                        <li>下载模板</li>
                        <li>填写数据</li>
                        <li>上传数据</li>
                    </ol>
                </Card>
            </>}

            {props.step === 1 && <>
                <Card type={"inner"}>
                    {GridImport && <Suspense>
                        <GridImport {...gridOpt} />
                    </Suspense>}
                </Card>
            </>}

        </Space>
    </>
}

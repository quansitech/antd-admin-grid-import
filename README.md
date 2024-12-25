## 介绍

> 在实际项目中，经常能遇到用户想用excel导入数据的场景。而通过excel编辑的数据很难控制数据的准确性和规范性。
> 而Grid-import要求用户先将excel数据导入系统，系统会自动转换出对应的web表格数据，让用户编辑和查看对应的出错提示，提交导入系统。
> 从而将不可控数据转变成可控的过程。

## 说明

此项目为antd-admin新仓库，若 qscmf低于14版本，请前往查看 [qs-grid-import](https://github.com/quansitech/qs-grid-import)

## 特点

+ 采用ant组件开发
+ 理论上支持无限嵌套子母表
+ 自动完成excel到grid格式的转换，开发者仅需关心业务逻辑接口
+ [qs-excel](https://github.com/tiderjian/qs-excel)完成excel的操作, gridImport仅关心web表格生成和完成两个组件间不同的数据格式转换
+ 支持导出excel错误信息，可批量更正后重新导入

## 安装

```shell
composer require quansitech/antd-admin-grid-import
```

### 前端依赖安装

```shell
npm install --save exceljs file-saver
```

## 截图

将excel数据转换成web grid
<img src="https://user-images.githubusercontent.com/1665649/71555235-cc3f0600-2a64-11ea-8b6e-8f45adae5750.png" />

导入出错错误提示
<img src="https://user-images.githubusercontent.com/1665649/71555252-263fcb80-2a65-11ea-86d0-f789be74a7fc.png" />

错误提示2
<img src="https://user-images.githubusercontent.com/1665649/71555263-4b343e80-2a65-11ea-8877-1226d8de6fa8.png" />

导入成功，确定跳转
<img src="https://user-images.githubusercontent.com/1665649/71555287-846cae80-2a65-11ea-8015-c9aae20271bf.png" />

## 用法

### 定义表格配置

+ unique 唯一设置

  设置哪些字段必须是唯一的，否则报错，可以是复合字段设置。

  设置类型数组，设置值为data 配置对应的key

+ data 配置值

  > 1. title 标题
  >2. key 列关键字
  >3. [type 列类型](#列类型)
  >4. [required 是否必填](#是否必填)
  >5. [validate_callback 验证回调](#验证回调)
  >6. width 列宽度百分比
  >7. validate_err_msg 自定义类型验证错误提示

+ 代码示例

```php
$options = [
    'unique' => [ 'project_id' ], //如果是复合唯一，设置多个key值 ['project_id', 'name']
    'data' => [
        [
            'title' => '项目',
            'key' => 'project_id',
            'type' => CellType::SELECT,
            'options' => [ 1 => '项目1', 2 => '项目2'],
            'required' => true,
            'width' => '20%',
            'validate_callback' => function($val){
                //验证逻辑
            }
        ],
        [
             'title' => '立项日期',
             'key' => 'create_date',
             'type' => CellType::DATE,
             'required' => true,
             'validate_err_msg' => '立项格式不正确，参考: 2020-01-01' //通过该设置重置日期类型的错误提示
        ],
        [
             'title' => '手机',
             'key' => 'telephone',
             'type' => CellType::INPUT,
             'required' => function($val, $row){
                return !$row['telephone'] && !$row['email'];
             },
             'required_err_msg' => '手机、邮箱不能同时为空' //通过该设置重置必填的错误提示
        ],
        [
             'title' => '邮箱',
             'key' => 'email',
             'type' => CellType::INPUT,
             'required' => function($val, $row){
                return !$row['telephone'] && !$row['email'];
             },
             'required_err_msg' => '手机、邮箱不能同时为空' //通过该设置重置必填的错误提示
        ]       
    ]
];
```

+ [children 子母表配置](#子母表)

#### 列类型

1. CellType::INPUT 单行输入框

2. CellType::DATE 日期 （格式: 2021-06-17）

3. CellType::INPUTNUMBER 数字

4. CellType::SELECT 下拉选择
   > 类型为下拉选择是，配置值必须设置 options 下拉值，格式为键值对的数组
   > ```php
     > $project_arr = [
     >     1 => '项目1',
     >     2 => '项目2',
     >     3 => '项目3'
     > ];
     > 
     > //省略详细配置，仅演示options的设置，以下雷同，不重复提示
     > 'options' => $project_arr
     >```

PS. 除INPUT类型外，其余类型都在提交时会对提交值分别进行类型有效性验证

5. CellType::MULTI_SELECT 多选
   > 设置方法同 CellType::SELECT
   > 唯一的区别是excel是文本输入类型，以半角英文逗号分隔
   >
   > 独有设置 ignore
   > ```php
    >  'ignore' => false // 设置为false后，保留不在options里的值，默认为ture
    > ``` 

6. CellType::DATETIME 日期+时间（格式: 2021-06-17 12:30:30）

#### 是否必填

支持2种设置类型

1. 布尔值

   > true表示必填，false表示非必填，默认为false

2. 闭包函数

   > 可通过该机制动态决定是否为必填项
   > 1. 第一个参数为该单元格值
   > 2. 第二个参数为该行的所有值
   >
   > ```php
    > 'required' => function($val, $row) {
    >    //业务逻辑 最后 return是否必填的布尔值
    > }
    >```

#### 验证回调

> 仅支持闭包函数，接受两个参数, 返回true表示验证通过，返回字符串表示验证不通过，同时表示不通过原因
> 1. 第一个参数为该单元格值
> 2. 第二个参数为该行的所有值
>
> ```php
> 'validate_callback' => function($val, $row){
>     //业务逻辑
> }
> ```

#### 子母表

> 子母表用于处理多层的数据导入情况，如用户需要在一个excel中，录入不同sheet数据，而不同sheet之间存在数据关联的情形。

> 举例： 一个项目，下面还存在不同的团队需要录入时，此时就可以通过设置二级子母表来一次完成项目和团队的数据导入

+ children值配置

  > children下的配置值其实与父级的配置一样，唯一不同的是多了个ref_key的值需要配置。该值接收一个数组，每个值表示与父级的关联字段
  > ```php
    > $options = [
    >   'data' => [
    >     [
    >         'title' => '项目',
    >         'key' => 'project_id',
    >         'type' => CellType::SELECT,
    >         'options' => [ 1 => '项目1', 2 => '项目2'],
    >         'required' => true,
    >         'validate_callback' => function($val){
    >             //验证逻辑
    >         }
    >     ]
    >   ],
    >   'children' => [
    >      'ref_key' => [ 'project_id' ],
    >      'data' => [
    >          [
    >             'title' => '团队名称',
    >             'key' => 'team_name',
    >             'type' => CellType::INPUT,
    >             'required' => true
    >          ]
    >       ] 
    >   ]
    > ];
    >```

PS. 子母表理论上支持无限嵌套，children下还可以继续设置children值，可按实际业务设置更复杂的导入方式。

### 根据配置值设置导出excel模板

 ```php
//第一个参数为转换驱动
//第二个参数为上面定义好的$options
$transcoder = new TranscoderFactory("QsExcel", $options);

//这里的的project和team与上面定义的options子母表关系对应，有多少层嵌套关系就可以转出多少个excel配置值，这里是两层关系
list($project, $team) = $transcoder->convertTo();

//这里是QsExcel的配置格式，可查看上面的qs-excel链接查看说明文档
$project_options = [
    'row_count' => 500,
    'headers' => $project
];

$team_options = [
    'row_count' => 500,
    'headers' => $team
];

//创建QsExcel对象，完成模板生成
$excel = new Excel();
$excel->addBuild((new \QsExcel\Builder\ListBuilder($project_options))->setSheetName('项目信息'));
$excel->addBuild((new \QsExcel\Builder\ListBuilder($team_options))->setSheetName('团队信息'));
$excel->output('项目团队资料导入.xlsx');
```

### 导入excel表格，生成grid  web表格

```php
//上传excel文件的路径
$file_path = '项目团队资料导入.xlsx';
$excel = new Excel();
$excel->setLoadFile($file_path);
//excel有多少张sheet需要读取数据，就设置多少个Loader
$excel->addLoader(new ListLoader());
$excel->addLoader(new ListLoader());
$list = $excel->load();

//这里将表头去掉，否则会出错
$res = [];
foreach($list as $v){
    unset($v[0]);
    $res[] = $v;
}

//根据$options生成转换器对象
$transcoder = new TranscoderFactory("QsExcel", $options);
//将上传的excel数据导入转换器
$transcoder->setData($res);
//$grid_data为通过转换器后，将excel数据转换成grid的数据格式
$grid_data = $transcoder->convertFrom();
```

下面是前端页面代码，可参考 [Import.tsx](./js/example/Import.tsx)

完成这步，就可以看到导入的数据已经转换成web表格，确认没错后可点击提交

### grid数据提交处理

```php
//$options不再说明了，就是最开始定义的配置
$grid_import = new GridImport($options);
//完成提交数据的填充和验证
//如果验证有问题，会返回false

$r = $grid_import->fill()->validate();
if($r === false){
    $errArr = $grid_import->responseErrArr();
    //将$errArr数组转换成json格式返回
    //前端grid组件接收到后，会在对应的单元格显示出错误提示
}

//验证通过，通过toArray方法返回导入的数组数据
$import_datas = $grid_import->toArray();
//剩下就是实际的业务逻辑了
//在处理的过程中如果有进一步出错，可以通过一下代码给grid组件返回出错提示
//$error_msg为需要显示的错误信息
$errArr = $grid_import->responseErrArr($error_msg);
//将$errArr数组转换成json格式返回
//前端grid组件接收到后，会通过警告提示显示出错误原因

//如果数据已经成功插入
//返回一个200响应即可，grid组件会显示导入成功提示
```

### 异步导入

前端组件配置

```javascript
// 开启注释
setGridOpt({
    //...其它参数

    async: true, //是否异步导入
    asyncProcessNotify: props.asyncProcessNotify || '', //进度请求地址
})
```

后端地址配置

+ submitUrl

> 验证数据没有问题，启动异步处理逻辑。并返回处理trans_id

+ asyncProcessNotify

> 1. 接收trans_id , 并根据trans_id查验异步处理进度情况，返回process，通知前端更新进度条
> 2. 如果处理过程中出错，返回 error: 1, error_msg: 错误原因

### 导入中处理异常，返回异常记录

业务场景：导入数据，如需请求第三方API，当网络异常或者API请求返回错误，需要将异常情况返回给用户

```php
//上传，excel数据转换等处理可看上面的代码说明，此处仅列出处理数据导入的代码
$grid_import = new GridImport($options);

$r = $grid_import->fill()->validate();
if($r === false){
    $errArr = $grid_import->responseErrArr();
    //将$errArr数组转换成json格式返回
    //前端grid组件接收到后，会在对应的单元格显示出错误提示
}
foreach($grid_import->getGrid()->getRows() as $index => &$row){
    
    //获取行数据，返回数组格式
    $row_data = $row->getRowData();
    
    //业务处理代码
    
    //处理完成
    if($r){
        //可根据业务需要，选择清除处理成功的数据
        //或者有一条数据不成功都将回滚，可选择不清除
        $grid_import->getGrid()->removeRow($index);
    }
    //处理失败
    else{
        //设置具体错误信息
        $row->setError('设置错误信息');
    }

}

if(处理失败){
    //构造错误应答
    $errArr = $grid_import->responseErrArr();
    //将$errArr数组转换成json格式返回
}
//处理成功
else{   
    //如果数据已经成功插入
    //返回一个200响应即可，grid组件会显示导入成功提示
    //如果是异步导入，返回process:100
}
```

### 导出excel错误信息

前端组件配置

```javascript
// 开启注释
setGridOpt({
    //...其它参数

    exportErrObj: {
        filename: "xxx错误信息.xlsx",// 导出文件名，默认为 错误信息.xlsx
        output: true, // 是否支持导出excel错误信息
    },
})
```
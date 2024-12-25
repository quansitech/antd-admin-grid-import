<?php

namespace QsGridImport;

use QsGridImport\Grid\Row;

class GridImport
{

    protected $option;
    protected $first_grid;

    public function __construct($option)
    {
        $this->option = $option;
    }


    public function fill($fill_json = '')
    {
        if ($fill_json) {
            $json = $fill_json;
        } else {
            $json = file_get_contents("php://input");
        }
        $row_data = json_decode(htmlspecialchars_decode($json), true);

        $this->first_grid = self::init($row_data);
        return $this;
    }

    protected function init($row_data, $level = 1): Grid
    {
        $option = Helper::getColumnOptionByLevel($this->option, $level);
        $grid = new Grid($option);
        $column_options = $option['data'];

        foreach ($row_data as $data) {
            $row = new Row($column_options, $data['data']);
            $grid->addRow($row);
            if (isset($data['children'])) {
                $row->addGrid(self::init($data['children'], ++$level));
                $level--;
            }
        }

        return $grid;
    }

    public function validate()
    {
        if (!$this->first_grid) {
            return false;
        }

        return $this->first_grid->validate();
    }

    public function responseErrArr($err_msg = '')
    {
        $row_data = $this->first_grid->toArray();
        return [
            'error' => 1,
            'error_msg' => $err_msg,
            'row_data' => $row_data
        ];
    }

    public function toArray()
    {
        if (!$this->first_grid) {
            self::fill();
        }
        return $this->first_grid->toArray();
    }

    public function getGrid()
    {
        return $this->first_grid;
    }

}
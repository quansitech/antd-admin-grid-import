<?php

namespace QsGridImport\Transcoder\QsExcel\ColumnType;

use QsExcel\Builder\ListBuilder;
use QsGridImport\Helper;

class Date extends ColumnType
{

    public function validate($val)
    {
        $date = self::formatDate($val);
        if (is_numeric($val)) {
            return $date != date('n/j/Y', strtotime($date)) ? false : true;
        } else {
            return !!strtotime($date);
        }
    }

    public function convertTo()
    {
        return [
            'type' => ListBuilder::DATE_TYPE
        ];
    }

    protected function formatDate($val)
    {
        $date = str_replace('-', '/', $val);
        is_numeric($date) && $date = Helper::excelTime($date, 'n/j/Y');
        return $date;
    }

    public function paraseValue($val)
    {
        $date = self::formatDate($val);
        return date('Y-m-d', strtotime($date));
    }
}
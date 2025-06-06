'use client';

import { Datagrid, DatagridProps } from 'react-admin';
import { cloneElement, Children, ReactElement } from 'react';

// Компонент, который оборачивает стандартный Datagrid и отключает сортировку
const NoSortDatagrid = (props: DatagridProps) => {
    // Клонируем все дочерние элементы и добавляем им sortable={false}
    const childrenWithoutSort = Children.map(props.children, (child) => {
        if (!child || typeof child !== 'object') return child;

        const element = child as ReactElement;
        return cloneElement(element, { sortable: false });
    });

    // Передаем модифицированных детей в стандартный Datagrid
    return <Datagrid {...props}>{childrenWithoutSort}</Datagrid>;
};

export default NoSortDatagrid;

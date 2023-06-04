import React, { useCallback, useEffect, useState, useReducer } from "react";
import "./App.css";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  GroupingState,
  getFilteredRowModel,
  RowData,
  getExpandedRowModel,
  getGroupedRowModel,
} from "@tanstack/react-table";

import Input from "./components/Input";
import { Dish } from "./models/Dish";
import { fetchData } from "./utils/dataService";

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void;
  }
}

const columnHelper = createColumnHelper<Dish>();

const columns = [
  columnHelper.accessor("image", {
    cell: (info) => <img className="p-2" src={info.getValue()} />,
  }),
  columnHelper.accessor("name", {
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("description", {
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("label", {
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("category", {
    cell: (info) => info.getValue(),
    enableGrouping: true,
  }),
  columnHelper.accessor("price", {
    cell: (info) => <Input info={info} />,
  }),
];

function App() {
  const [data, setData] = useState([]);
  const [grouping, setGrouping] = React.useState<GroupingState>([]);
  const rerender = useReducer(() => ({}), {})[1];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    meta: {
      updateData: (rowIndex, columnId, value) => {
        // Skip page index reset until after next rerender
        // skipAutoResetPageIndex();
        setData((old: any) =>
          old.map((row: number, index: number) => {
            if (index === rowIndex) {
              return {
                ...old[rowIndex]!,
                [columnId]: value,
              };
            }
            return row;
          })
        );
      },
    },
    state: {
      grouping,
    },
    onGroupingChange: setGrouping,
    getExpandedRowModel: getExpandedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    // debugTable: true,
  });

  const saveData = useCallback(() => {
    console.log("inside saveData ", data);
    sessionStorage.setItem("dishes", JSON.stringify(data));
  }, [data]);

  const resetData = useCallback(async () => {
    sessionStorage.removeItem("dishes");
    setData([]);
    fetchData(setData);
    rerender();
  }, []);

  useEffect(() => {
    fetchData(setData);
  }, []);

  console.log("inside App");

  if (!data || !data.length) return <h1>Loading. Please Wait...</h1>;

  return (
    <div className="p-2">
      <table className="p-2 border-collapse border-[1px] border-gray-500 w-full rounded-md">
        <colgroup>
          <col span={1} style={{ width: "15%" }} />
          <col span={1} style={{ width: "15%" }} />
          <col span={1} style={{ width: "30%" }} />
          <col span={1} style={{ width: "15%" }} />
          <col span={1} style={{ width: "15%" }} />
          <col span={1} style={{ width: "10%" }} />
        </colgroup>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr
              key={headerGroup.id}
              className=" border-[1px] border-gray-500 p-4"
            >
              {headerGroup.headers.map((header) => {
                return (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    className="capitalize border-[1px] border-gray-500 p-4"
                  >
                    {header.isPlaceholder ? null : (
                      <div>
                        {header.column.id === "category" &&
                        header.column.getCanGroup() ? (
                          // If the header can be grouped, let's add a toggle
                          <button
                            {...{
                              onClick: header.column.getToggleGroupingHandler(),
                              style: {
                                cursor: "pointer",
                              },
                            }}
                          >
                            {header.column.getIsGrouped()
                              ? `🛑(${header.column.getGroupedIndex()}) `
                              : `👊 `}
                          </button>
                        ) : null}{" "}
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => {
            return (
              <tr key={row.id} className="border-[1px] border-gray-500 ">
                {row.getVisibleCells().map((cell) => {
                  return (
                    <td
                      className="first-letter:capitalize border-[1px] border-gray-500 text-center"
                      {...{
                        key: cell.id,
                        style: {
                          background: cell.getIsGrouped()
                            ? "#0aff0082"
                            : cell.getIsAggregated()
                            ? "#ffa50078"
                            : cell.getIsPlaceholder()
                            ? "#ff000042"
                            : "white",
                        },
                      }}
                    >
                      {cell.getIsGrouped() ? (
                        // If it's a grouped cell, add an expander and row count
                        <>
                          <button
                            {...{
                              onClick: row.getToggleExpandedHandler(),
                              style: {
                                cursor: row.getCanExpand()
                                  ? "pointer"
                                  : "normal",
                              },
                            }}
                          >
                            {row.getIsExpanded() ? "👇" : "👉"}{" "}
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}{" "}
                            ({row.subRows.length})
                          </button>
                        </>
                      ) : cell.getIsAggregated() ? (
                        // If the cell is aggregated, use the Aggregated
                        // renderer for cell
                        flexRender(
                          cell.column.columnDef.aggregatedCell ??
                            cell.column.columnDef.cell,
                          cell.getContext()
                        )
                      ) : cell.getIsPlaceholder() ? null : ( // For cells with repeated values, render null
                        // Otherwise, just render the regular cell
                        flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <button
        className="p-4 border-[1px] rounded-lg m-4 bg-green-500 text-white"
        onClick={saveData}
      >
        Save Data
      </button>
      <button
        className="p-4 border-[1px] rounded-lg bg-red-500 text-white"
        onClick={resetData}
      >
        Reset Data
      </button>
    </div>
  );
}

export default App;

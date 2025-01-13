// src/components/ui/DataTable.tsx

"use client";

import * as React from "react";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  flexRender,
  HeaderGroup,
  Header,
  Row,
  Cell,
  Column,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Progress } from "@/components/ui/progress";

interface UserData {
  name: string;
  email: string;
  progress: number;
}

interface DataTableProps {
  data: UserData[];
}

export const DataTable: React.FC<DataTableProps> = ({ data }) => {
  // Define columns within the client component to avoid passing functions from server to client
  const columns: ColumnDef<UserData>[] = React.useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => row.getValue("name"),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => row.getValue("email"),
      },
      {
        accessorKey: "progress",
        header: "Progress",
        cell: ({ row }) => {
          const progress = row.getValue<number>("progress");
          return (
            <div className="flex items-center space-x-2">
              <Progress value={progress} className="w-32" />
              <span>{progress}%</span>
            </div>
          );
        },
      },
    ],
    []
  );

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(
    {}
  );

  const table = useReactTable<UserData>({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: true,
  });

  return (
    <div className="w-full h-full p-8 overflow-auto">
      {/* Toolbar */}
      <div className="flex items-center justify-between pb-4">
        {/* Search Input */}
        <Input
          placeholder="Search by name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            table.getColumn("name")?.setFilterValue(e.target.value)
          }
          className="max-w-sm"
        />

        {/* Column Visibility Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table.getAllLeafColumns().map((column: Column<UserData, unknown>) => {
              // Skip if the column doesn't have an ID (unlikely, but just to be safe)
              if (!column.id) return null;

              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(checked: boolean) =>
                    column.toggleVisibility(checked)
                  }
                >
                  {column.id.charAt(0).toUpperCase() + column.id.slice(1)}
                </DropdownMenuCheckboxItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <Table className="min-w-full bg-black text-white rounded-lg">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup: HeaderGroup<UserData>) => (
            <TableRow key={headerGroup.id} className="bg-zinc-800">
              {headerGroup.headers.map((header: Header<UserData, unknown>) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : (
                    <div
                      className={
                        header.column.getCanSort()
                          ? "cursor-pointer select-none flex items-center gap-2"
                          : ""
                      }
                      onClick={header.column.getToggleSortingHandler()}
                      role={
                        header.column.getCanSort() ? "button" : undefined
                      }
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: <ArrowUpDown className="w-4 h-4" />,
                        desc: <ChevronDown className="w-4 h-4" />,
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table
              .getRowModel()
              .rows.map((row: Row<UserData>) => (
                <TableRow key={row.id} className="transition-colors duration-200">
                  {row.getVisibleCells().map((cell: Cell<UserData, unknown>) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="text-center py-4 text-gray-400"
              >
                No users found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between py-4">
        {/* Rows Per Page */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Rows per page:</span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              table.setPageSize(Number(e.target.value))
            }
            className="border border-gray-600 rounded p-1 bg-black text-white"
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>

        {/* Page Navigation */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 w-8 p-0"
          >
            <ChevronDown className="rotate-180 transform" size={16} />
            <span className="sr-only">Previous Page</span>
          </Button>
          <span className="text-sm text-gray-400">
            Page{" "}
            <strong>
              {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </strong>
          </span>
          <Button
            variant="ghost"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 w-8 p-0"
          >
            <ChevronDown size={16} />
            <span className="sr-only">Next Page</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

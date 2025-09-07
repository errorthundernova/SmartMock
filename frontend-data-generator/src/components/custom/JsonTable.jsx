import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const JsonTable = ({ jsonData }) => {
  let dataArray = [];

  // Logic to find the array of data, whether it's the root object or nested
  if (Array.isArray(jsonData)) {
    dataArray = jsonData;
  } else if (typeof jsonData === 'object' && jsonData !== null) {
    const arrayKey = Object.keys(jsonData).find(key => Array.isArray(jsonData[key]));
    if (arrayKey) {
      dataArray = jsonData[arrayKey];
    }
  }

  // If no valid data array is found, don't render anything
  if (dataArray.length === 0) {
    return <p className="text-sm text-muted-foreground p-2">Could not render table from the provided JSON.</p>;
  }

  const headers = Object.keys(dataArray[0] || {});

  return (
    <div className="my-2 bg-black/50 p-2 rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((header) => (
              <TableHead key={header} className="text-white">{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {dataArray.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {headers.map((header) => (
                <TableCell key={header}>
                  {typeof row[header] === 'object' ? JSON.stringify(row[header]) : String(row[header])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default JsonTable;
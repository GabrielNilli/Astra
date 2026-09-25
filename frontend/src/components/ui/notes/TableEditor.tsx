// =================================
//  IMPORTS
// =================================
import { Plus, X } from "lucide-react";
import type { NoteTable } from "../../../api/notes";

// =================================
//  COMPONENT
// =================================
export function TableEditor({
  headers,
  rows,
  onChange,
  fieldClassName,
}: {
  headers: string[];
  rows: string[][];
  onChange: (value: NoteTable) => void;
  fieldClassName: string;
}) {
  // =================================
  //  FUNCTIONS
  // =================================
  function updateHeader(index: number, value: string) {
    onChange({
      headers: headers.map((header, i) => (i === index ? value : header)),
      rows,
    });
  }

  function addColumn() {
    onChange({
      headers: [...headers, ""],
      rows: rows.map((row) => [...row, ""]),
    });
  }

  function removeColumn(index: number) {
    onChange({
      headers: headers.filter((_, i) => i !== index),
      rows: rows.map((row) => row.filter((_, i) => i !== index)),
    });
  }

  function updateCell(rowIndex: number, colIndex: number, value: string) {
    onChange({
      headers,
      rows: rows.map((row, r) =>
        r === rowIndex
          ? row.map((cell, c) => (c === colIndex ? value : cell))
          : row,
      ),
    });
  }

  function addRow() {
    onChange({ headers, rows: [...rows, headers.map(() => "")] });
  }

  function removeRow(rowIndex: number) {
    onChange({ headers, rows: rows.filter((_, r) => r !== rowIndex) });
  }

  // =================================
  //  RENDER
  // =================================
  return (
    <div className="space-y-1.5">
      {headers.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-1">
            <thead>
              <tr>
                {headers.map((header, colIndex) => (
                  <th key={colIndex} className="p-0">
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        placeholder={`Colonna ${colIndex + 1}`}
                        value={header}
                        onChange={(event) =>
                          updateHeader(colIndex, event.target.value)
                        }
                        className={`${fieldClassName} min-w-24 text-xs font-semibold`}
                      />
                      <button
                        type="button"
                        onClick={() => removeColumn(colIndex)}
                        aria-label="Rimuovi colonna"
                        className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-base-mid hover:bg-base-mid/10"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, colIndex) => (
                    <td key={colIndex} className="p-0">
                      <input
                        type="text"
                        value={cell}
                        onChange={(event) =>
                          updateCell(rowIndex, colIndex, event.target.value)
                        }
                        className={`${fieldClassName} min-w-24 text-xs`}
                      />
                    </td>
                  ))}
                  <td className="p-0">
                    <button
                      type="button"
                      onClick={() => removeRow(rowIndex)}
                      aria-label="Rimuovi riga"
                      className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-base-mid hover:bg-base-mid/10"
                    >
                      <X size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={addColumn}
          className="flex cursor-pointer items-center gap-1 text-xs font-medium text-accent hover:underline"
        >
          <Plus size={14} />
          Aggiungi colonna
        </button>
        {headers.length > 0 && (
          <button
            type="button"
            onClick={addRow}
            className="flex cursor-pointer items-center gap-1 text-xs font-medium text-accent hover:underline"
          >
            <Plus size={14} />
            Aggiungi riga
          </button>
        )}
      </div>
    </div>
  );
}

// src/components/UI/Table.jsx
const Table = ({
  columns = [],
  data = [],
  onRowClick,
  selectedRowId,
  className = "",
  showHeader = true,
  striped = true,
  hoverable = true
}) => {
  const tableClasses = `w-full border-collapse ${className}`
  
  const getRowClasses = (item, index) => {
    let classes = "transition-colors duration-150"
    
    if (onRowClick) {
      classes += " cursor-pointer"
    }
    
    if (selectedRowId && item.id === selectedRowId) {
      classes += " bg-blue-600 text-white"
    } else {
      if (striped && index % 2 === 1) {
        classes += " bg-gray-50"
      }
      if (hoverable) {
        classes += " hover:bg-blue-50"
      }
    }
    
    return classes
  }
  
  return (
    <div className="overflow-x-auto">
      <table className={tableClasses}>
        {showHeader && (
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-100 border border-gray-300"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {data.map((item, rowIndex) => (
            <tr
              key={item.id || rowIndex}
              className={getRowClasses(item, rowIndex)}
              onClick={() => onRowClick && onRowClick(item)}
            >
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className="px-4 py-3 text-sm border border-gray-300"
                >
                  {column.render ? column.render(item) : item[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Table

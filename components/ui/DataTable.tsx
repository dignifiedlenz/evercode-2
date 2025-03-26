"use client"

import React, { useState, useMemo } from "react"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { motion } from "framer-motion"

// Enhanced user data interface
interface UserData {
  name: string
  email: string
  progress: number
}

interface DataTableProps {
  data: UserData[]
}

export function DataTable({ data }: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<{
    key: keyof UserData,
    direction: 'ascending' | 'descending'
  }>({
    key: 'name',
    direction: 'ascending'
  })

  // Search and sort functionality
  const filteredAndSortedData = useMemo(() => {
    // First filter the data
    const filteredData = data.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    // Then sort the filtered data
    return [...filteredData].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1
      }
      return 0
    })
  }, [data, searchTerm, sortConfig])
  
  // Handle sorting
  const requestSort = (key: keyof UserData) => {
    let direction: 'ascending' | 'descending' = 'ascending'
    
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending'
    }
    
    setSortConfig({ key, direction })
  }
  
  // Get sort indicator
  const getSortDirectionIndicator = (key: keyof UserData) => {
    if (sortConfig.key !== key) return null
    return sortConfig.direction === 'ascending' ? '↑' : '↓'
  }
  
  return (
    <div className="bg-black/70 p-6 rounded-xl border border-gray-800 shadow-xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-white">Student Progress</h2>
        
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/50 border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      
      <div className="rounded-lg overflow-hidden border border-gray-800">
        <Table>
          <TableCaption>Course progress for all students in your group</TableCaption>
          <TableHeader className="bg-gray-900">
            <TableRow>
              <TableHead 
                className="text-white cursor-pointer hover:text-secondary transition-colors"
                onClick={() => requestSort('name')}
              >
                Name {getSortDirectionIndicator('name')}
              </TableHead>
              <TableHead 
                className="text-white cursor-pointer hover:text-secondary transition-colors"
                onClick={() => requestSort('email')}
              >
                Email {getSortDirectionIndicator('email')}
              </TableHead>
              <TableHead 
                className="text-white text-right cursor-pointer hover:text-secondary transition-colors"
                onClick={() => requestSort('progress')}
              >
                Progress {getSortDirectionIndicator('progress')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedData.length > 0 ? (
              filteredAndSortedData.map((user, index) => (
                <motion.tr 
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group hover:bg-black/40"
                >
                  <TableCell className="font-medium text-white border-t border-gray-800">
                    {user.name}
                  </TableCell>
                  <TableCell className="text-gray-300 border-t border-gray-800">
                    {user.email}
                  </TableCell>
                  <TableCell className="text-right border-t border-gray-800">
                    <div className="flex items-center justify-end gap-3">
                      <div className="w-full max-w-[120px] h-2 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div 
                          className={`h-full rounded-full ${getProgressColor(user.progress)}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${user.progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                      <span className={`font-medium ${getTextColorClass(user.progress)}`}>
                        {user.progress}%
                      </span>
                    </div>
                  </TableCell>
                </motion.tr>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-gray-400 py-8">
                  No students found matching "{searchTerm}"
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="mt-4 text-gray-400 text-sm">
        Showing {filteredAndSortedData.length} of {data.length} students
      </div>
    </div>
  )
}

// Helper functions for styling based on progress
function getProgressColor(progress: number): string {
  if (progress < 25) return 'bg-red-500'
  if (progress < 50) return 'bg-orange-500'
  if (progress < 75) return 'bg-yellow-500'
  return 'bg-green-500'
}

function getTextColorClass(progress: number): string {
  if (progress < 25) return 'text-red-400'
  if (progress < 50) return 'text-orange-400'
  if (progress < 75) return 'text-yellow-400'
  return 'text-green-400'
} 
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import PartialDateInput from '@/components/partial-date-input'
import { PersonModal } from '@/components/manage/person-modal'
import { MarriageModal } from '@/components/manage/marriage-modal'
import { DeleteConfirmModal } from '@/components/manage/delete-modal'
import { PartialDate } from '@/lib/models'

describe('Component Tests', () => {
  describe('PartialDateInput', () => {
    test('should render with default state', () => {
      const onChange = jest.fn()
      render(<PartialDateInput value={undefined} onChange={onChange} label="Test Date" />)
      
      expect(screen.getByText('Test Date')).toBeInTheDocument()
      expect(screen.getByText('Specific Date')).toBeInTheDocument()
      expect(screen.getByText('Date Range')).toBeInTheDocument()
    })

    test('should call onChange when year is entered', async () => {
      const onChange = jest.fn()
      render(<PartialDateInput value={undefined} onChange={onChange} label="Test Date" />)
      
      const yearInput = screen.getByPlaceholderText('Year')
      fireEvent.change(yearInput, { target: { value: '1990' } })
      
      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith({ year: 1990 })
      })
    })

    test('should display existing date values', () => {
      const onChange = jest.fn()
      const value: PartialDate = { year: 1990, month: 6, day: 15 }
      
      render(<PartialDateInput value={value} onChange={onChange} label="Test Date" />)
      
      expect(screen.getByDisplayValue('1990')).toBeInTheDocument()
      expect(screen.getByDisplayValue('15')).toBeInTheDocument()
    })

    test('should switch to range mode', async () => {
      const onChange = jest.fn()
      render(<PartialDateInput value={undefined} onChange={onChange} label="Test Date" />)
      
      const rangeRadio = screen.getByText('Date Range').previousSibling as HTMLInputElement
      fireEvent.click(rangeRadio)
      
      expect(screen.getByText('From')).toBeInTheDocument()
      expect(screen.getByText('To')).toBeInTheDocument()
    })

    test('should handle approximate date checkbox', async () => {
      const onChange = jest.fn()
      render(<PartialDateInput value={{}} onChange={onChange} label="Test Date" />)
      
      const approximateCheckbox = screen.getByText('Approximate date').previousSibling as HTMLInputElement
      fireEvent.click(approximateCheckbox)
      
      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith({ approximate: true })
      })
    })

    test('should clear date when clear button is clicked', async () => {
      const onChange = jest.fn()
      const value: PartialDate = { year: 1990 }
      
      render(<PartialDateInput value={value} onChange={onChange} label="Test Date" />)
      
      const clearButton = screen.getByText('Clear date')
      fireEvent.click(clearButton)
      
      expect(onChange).toHaveBeenCalledWith(undefined)
    })
  })

  describe('PersonModal', () => {
    const mockPersons = [
      { id: 'p1', name: 'Test Person 1', _id: '1', createdAt: new Date(), updatedAt: new Date() },
      { id: 'p2', name: 'Test Person 2', _id: '2', createdAt: new Date(), updatedAt: new Date() },
    ]

    const mockMarriages = [
      { 
        id: 'm1', 
        _id: '1', 
        spouses: ['p1', 'p2'], 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
    ]

    test('should render add person modal', () => {
      const mockProps = {
        editingPerson: {},
        setEditingPerson: jest.fn(),
        savePerson: jest.fn(),
        persons: mockPersons,
        marriages: mockMarriages,
      }

      render(<PersonModal {...mockProps} />)
      
      expect(screen.getByRole('heading', { name: 'Add Person' })).toBeInTheDocument()
      expect(screen.getByText('Full Name *')).toBeInTheDocument()
      expect(screen.getByText('Gender')).toBeInTheDocument()
    })

    test('should render edit person modal with existing data', () => {
      const editingPerson = {
        id: 'p1',
        name: 'John Doe',
        gender: 'male' as const,
        phone: '+1234567890'
      }

      const mockProps = {
        editingPerson,
        setEditingPerson: jest.fn(),
        savePerson: jest.fn(),
        persons: mockPersons,
        marriages: mockMarriages,
      }

      render(<PersonModal {...mockProps} />)
      
      expect(screen.getByRole('heading', { name: 'Edit Person' })).toBeInTheDocument()
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
      expect(screen.getByDisplayValue('+1234567890')).toBeInTheDocument()
    })

    test('should call savePerson when form is submitted', async () => {
      const savePerson = jest.fn()
      const editingPerson = { name: 'New Person' }

      const mockProps = {
        editingPerson,
        setEditingPerson: jest.fn(),
        savePerson,
        persons: mockPersons,
        marriages: mockMarriages,
      }

      render(<PersonModal {...mockProps} />)
      
      const saveButton = screen.getByRole('button', { name: 'Add Person' })
      fireEvent.click(saveButton)
      
      expect(savePerson).toHaveBeenCalledWith(editingPerson)
    })
  })

  describe('MarriageModal', () => {
    const mockPersons = [
      { id: 'p1', name: 'Person 1', _id: '1', createdAt: new Date(), updatedAt: new Date() },
      { id: 'p2', name: 'Person 2', _id: '2', createdAt: new Date(), updatedAt: new Date() },
      { id: 'p3', name: 'Person 3', _id: '3', createdAt: new Date(), updatedAt: new Date() },
    ]

    test('should render add marriage modal', () => {
      const editingMarriage = { spouses: ['', ''] }

      const mockProps = {
        editingMarriage,
        setEditingMarriage: jest.fn(),
        saveMarriage: jest.fn(),
        persons: mockPersons,
      }

      render(<MarriageModal {...mockProps} />)
      
      expect(screen.getByRole('heading', { name: 'Add Marriage' })).toBeInTheDocument()
      expect(screen.getAllByText('Spouse 1 *')).toHaveLength(1)
      expect(screen.getAllByText('Spouse 2 *')).toHaveLength(1)
    })

    test('should populate spouse dropdowns with available persons', () => {
      const editingMarriage = { spouses: ['', ''] }

      const mockProps = {
        editingMarriage,
        setEditingMarriage: jest.fn(),
        saveMarriage: jest.fn(),
        persons: mockPersons,
      }

      render(<MarriageModal {...mockProps} />)
      
      expect(screen.getAllByText('Person 1 (p1)').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Person 2 (p2)').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Person 3 (p3)').length).toBeGreaterThan(0)
    })

    test('should call saveMarriage when form is submitted', () => {
      const saveMarriage = jest.fn()
      const editingMarriage = { spouses: ['p1', 'p2'] }

      const mockProps = {
        editingMarriage,
        setEditingMarriage: jest.fn(),
        saveMarriage,
        persons: mockPersons,
      }

      render(<MarriageModal {...mockProps} />)
      
      const saveButton = screen.getByRole('button', { name: 'Add Marriage' })
      fireEvent.click(saveButton)
      
      expect(saveMarriage).toHaveBeenCalledWith(editingMarriage)
    })
  })

  describe('DeleteConfirmModal', () => {
    test('should render delete confirmation modal', () => {
      const mockProps = {
        isOpen: true,
        onClose: jest.fn(),
        onConfirm: jest.fn(),
        title: 'Delete Person',
        message: 'Are you sure you want to delete this person?'
      }

      render(<DeleteConfirmModal {...mockProps} />)
      
      expect(screen.getByText('Delete Person')).toBeInTheDocument()
      expect(screen.getByText('Are you sure you want to delete this person?')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByText('Delete')).toBeInTheDocument()
    })

    test('should call onConfirm when delete button is clicked', () => {
      const onConfirm = jest.fn()
      const onClose = jest.fn()

      const mockProps = {
        isOpen: true,
        onClose,
        onConfirm,
        title: 'Delete Person',
        message: 'Are you sure you want to delete this person?'
      }

      render(<DeleteConfirmModal {...mockProps} />)
      
      const deleteButton = screen.getByText('Delete')
      fireEvent.click(deleteButton)
      
      expect(onConfirm).toHaveBeenCalled()
      expect(onClose).toHaveBeenCalled()
    })

    test('should call onClose when cancel button is clicked', () => {
      const onClose = jest.fn()

      const mockProps = {
        isOpen: true,
        onClose,
        onConfirm: jest.fn(),
        title: 'Delete Person',
        message: 'Are you sure you want to delete this person?'
      }

      render(<DeleteConfirmModal {...mockProps} />)
      
      const cancelButton = screen.getByText('Cancel')
      fireEvent.click(cancelButton)
      
      expect(onClose).toHaveBeenCalled()
    })

    test('should not render when isOpen is false', () => {
      const mockProps = {
        isOpen: false,
        onClose: jest.fn(),
        onConfirm: jest.fn(),
        title: 'Delete Person',
        message: 'Are you sure you want to delete this person?'
      }

      render(<DeleteConfirmModal {...mockProps} />)
      
      expect(screen.queryByText('Delete Person')).not.toBeInTheDocument()
    })
  })
})
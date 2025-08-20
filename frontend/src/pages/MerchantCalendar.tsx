import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, X, Check, ChevronLeft, ChevronRight, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import { Link } from 'react-router-dom';

// Types
type TimeSlot = {
  id: number;
  day: string;
  startTime: string;
  endTime: string;
};

type Appointment = {
  id: number;
  customerName: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  service: string;
  notes?: string;
};

type BusinessHours = {
  [key: string]: {
    isOpen: boolean;
    openTime: string;
    closeTime: string;
  };
};

const MerchantCalendar = () => {
  const { toast } = useToast();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false);
  const [showHoursDialog, setShowHoursDialog] = useState(false);
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize with default business hours
  const [businessHours, setBusinessHours] = useState<BusinessHours>({
    monday: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
    tuesday: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
    wednesday: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
    thursday: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
    friday: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
    saturday: { isOpen: true, openTime: '09:00', closeTime: '15:00' },
    sunday: { isOpen: false, openTime: '09:00', closeTime: '15:00' },
  });
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        setLoading(true);
        // Try to fetch appointments from API
        // const appointmentsResponse = await merchantsAPI.getAppointments();
        // setAppointments(appointmentsResponse.data || []);
        
        // For now, use empty array until appointments API is implemented
        setAppointments([]);
      } catch (err) {
        console.error('Error fetching calendar data:', err);
        setError('Failed to load calendar data');
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarData();
  }, []);
  
  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(year, month, i);
      days.push(dayDate);
    }
    
    return days;
  };
  
  const getMonthStartDay = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };
  
  const formatMonth = (date: Date) => {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };
  
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  const getAppointmentsForDate = (date: Date) => {
    const dateString = formatDate(date);
    return appointments.filter(appointment => appointment.date === dateString);
  };
  
  const hasAppointments = (date: Date) => {
    return getAppointmentsForDate(date).length > 0;
  };
  
  const updateBusinessHours = (day: string, field: keyof typeof businessHours.monday, value: any) => {
    setBusinessHours({
      ...businessHours,
      [day]: {
        ...businessHours[day],
        [field]: value
      }
    });
  };
  
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };
  
  const handleStatusChange = (appointmentId: number, newStatus: 'confirmed' | 'pending' | 'cancelled') => {
    setAppointments(appointments.map(appointment => 
      appointment.id === appointmentId 
        ? { ...appointment, status: newStatus } 
        : appointment
    ));
    
    toast({
      title: "Appointment updated",
      description: `Appointment status changed to ${newStatus}`,
    });
  };
  
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const days = getDaysInMonth(currentMonth);
  const startDay = getMonthStartDay(currentMonth);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Calendar & Appointments</h1>
              <p className="text-gray-600 mt-2">Manage your business hours and customer appointments</p>
            </div>
            <Link to="/merchant/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
        
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="hours">Business Hours</TabsTrigger>
          </TabsList>
          
          {/* Calendar Tab */}
          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{formatMonth(currentMonth)}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={previousMonth}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={nextMonth}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Day headers */}
                  {daysOfWeek.map(day => (
                    <div key={day} className="text-center font-medium text-sm py-2">
                      {day}
                    </div>
                  ))}
                  
                  {/* Empty cells for days before the start of the month */}
                  {Array.from({ length: startDay }).map((_, index) => (
                    <div key={`empty-${index}`} className="h-24 border rounded-md bg-gray-50"></div>
                  ))}
                  
                  {/* Days of the month */}
                  {days.map(day => {
                    const isToday = new Date().toDateString() === day.toDateString();
                    const isSelected = selectedDate && selectedDate.toDateString() === day.toDateString();
                    const dayAppointments = getAppointmentsForDate(day);
                    
                    return (
                      <div 
                        key={day.toString()} 
                        className={`h-24 border rounded-md p-1 cursor-pointer transition-colors ${
                          isToday ? 'bg-blue-50 border-blue-200' : 
                          isSelected ? 'bg-primary/10 border-primary' : 
                          'hover:bg-gray-50'
                        }`}
                        onClick={() => handleDateClick(day)}
                      >
                        <div className="flex justify-between items-start">
                          <span className={`text-sm font-medium ${isToday ? 'text-blue-600' : ''}`}>
                            {day.getDate()}
                          </span>
                          {hasAppointments(day) && (
                            <span className="bg-primary text-white text-xs px-1.5 py-0.5 rounded-full">
                              {dayAppointments.length}
                            </span>
                          )}
                        </div>
                        
                        <div className="mt-1 space-y-1 overflow-hidden max-h-16">
                          {dayAppointments.slice(0, 2).map(appointment => (
                            <div 
                              key={appointment.id} 
                              className={`text-xs px-1.5 py-0.5 rounded truncate ${
                                appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                appointment.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                'bg-red-100 text-red-800'
                              }`}
                            >
                              {appointment.time} - {appointment.customerName}
                            </div>
                          ))}
                          {dayAppointments.length > 2 && (
                            <div className="text-xs text-gray-500 pl-1">
                              +{dayAppointments.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Selected Date Details */}
                {selectedDate && (
                  <div className="mt-6 border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-lg">
                        {selectedDate.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </h3>
                      <Button 
                        size="sm"
                        onClick={() => setShowAppointmentDialog(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Appointment
                      </Button>
                    </div>
                    
                    {getAppointmentsForDate(selectedDate).length > 0 ? (
                      <div className="space-y-3">
                        {getAppointmentsForDate(selectedDate).map(appointment => (
                          <div key={appointment.id} className="border rounded-md p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{appointment.customerName}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                  appointment.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {appointment.status}
                                </span>
                              </div>
                              <span className="text-sm text-gray-500">{appointment.time}</span>
                            </div>
                            <p className="text-sm text-gray-700 mb-1">Service: {appointment.service}</p>
                            {appointment.notes && (
                              <p className="text-sm text-gray-500 italic">{appointment.notes}</p>
                            )}
                            
                            <div className="flex items-center gap-2 mt-3">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                                disabled={appointment.status === 'confirmed'}
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Confirm
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                                disabled={appointment.status === 'cancelled'}
                                className="text-red-500 border-red-200 hover:bg-red-50"
                              >
                                <X className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        No appointments scheduled for this day
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Appointments Tab */}
          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Appointments</CardTitle>
                  <Button 
                    size="sm"
                    onClick={() => {
                      setSelectedDate(new Date());
                      setShowAppointmentDialog(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    New Appointment
                  </Button>
                </div>
                <CardDescription>View and manage all your upcoming appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments.length > 0 ? (
                    appointments
                      .sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime())
                      .map(appointment => (
                        <div key={appointment.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">{appointment.customerName}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              appointment.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {appointment.status}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-sm text-gray-500">Date</p>
                              <p className="text-sm font-medium">
                                {new Date(appointment.date).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Time</p>
                              <p className="text-sm font-medium">{appointment.time}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Service</p>
                              <p className="text-sm font-medium">{appointment.service}</p>
                            </div>
                          </div>
                          
                          {appointment.notes && (
                            <div className="mb-3">
                              <p className="text-sm text-gray-500">Notes</p>
                              <p className="text-sm italic">{appointment.notes}</p>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                              disabled={appointment.status === 'confirmed'}
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Confirm
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                              disabled={appointment.status === 'cancelled'}
                              className="text-red-500 border-red-200 hover:bg-red-50"
                            >
                              <X className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-12">
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-600 mb-2">No appointments yet</h3>
                      <p className="text-gray-500 mb-4">You don't have any appointments scheduled</p>
                      <Button 
                        onClick={() => {
                          setSelectedDate(new Date());
                          setShowAppointmentDialog(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Create Appointment
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Business Hours Tab */}
          <TabsContent value="hours">
            <Card>
              <CardHeader>
                <CardTitle>Business Hours</CardTitle>
                <CardDescription>Set your regular business hours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(businessHours).map(([day, hours]) => (
                    <div key={day} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-24">
                          <span className="font-medium capitalize">{day}</span>
                        </div>
                        {hours.isOpen ? (
                          <div className="text-sm">
                            <span>{hours.openTime}</span>
                            <span className="mx-2">-</span>
                            <span>{hours.closeTime}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Closed</span>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setEditingDay(day);
                          setShowHoursDialog(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Add/Edit Appointment Dialog */}
      <Dialog open={showAppointmentDialog} onOpenChange={setShowAppointmentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Appointment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name
              </label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter customer name"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  defaultValue={selectedDate ? formatDate(selectedDate) : undefined}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input 
                  type="time" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service
              </label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select a service</option>
                <option value="Product Demo">Product Demo</option>
                <option value="Consultation">Consultation</option>
                <option value="Technical Support">Technical Support</option>
                <option value="Sales Meeting">Sales Meeting</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
                placeholder="Add any additional notes"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAppointmentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast({
                title: "Appointment created",
                description: "The appointment has been successfully created",
              });
              setShowAppointmentDialog(false);
            }}>
              Save Appointment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Edit Business Hours Dialog */}
      {editingDay && (
        <Dialog open={showHoursDialog} onOpenChange={setShowHoursDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Business Hours - {editingDay.charAt(0).toUpperCase() + editingDay.slice(1)}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="isOpen"
                  checked={businessHours[editingDay].isOpen}
                  onChange={(e) => updateBusinessHours(editingDay, 'isOpen', e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="isOpen" className="text-sm font-medium text-gray-700">
                  Open on this day
                </label>
              </div>
              
              {businessHours[editingDay].isOpen && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Opening Time
                    </label>
                    <input 
                      type="time" 
                      value={businessHours[editingDay].openTime}
                      onChange={(e) => updateBusinessHours(editingDay, 'openTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Closing Time
                    </label>
                    <input 
                      type="time" 
                      value={businessHours[editingDay].closeTime}
                      onChange={(e) => updateBusinessHours(editingDay, 'closeTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowHoursDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast({
                  title: "Business hours updated",
                  description: `Hours for ${editingDay} have been updated`,
                });
                setShowHoursDialog(false);
              }}>
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default MerchantCalendar;
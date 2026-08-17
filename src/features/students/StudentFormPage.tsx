'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Field, Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { studentsApi } from '@/api/students.api';
import { coursesApi } from '@/api/courses.api';
import { batchesApi } from '@/api/batches.api';
import { getErrorMessage } from '@/api/client';
import { toast } from '@/store/toast.store';
import { Skeleton } from '@/components/ui/Skeleton';

const schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Enter a valid email'),
  mobile: z.string().min(7, 'Enter a valid mobile number'),
  alternateMobile: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional().or(z.literal('')),
  dob: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  pincode: z.string().optional(),
  highestQualification: z.string().optional(),
  college: z.string().optional(),
  university: z.string().optional(),
  graduationYear: z.number().optional(),
  percentage: z.number().optional(),
  skills: z.string().optional(),
  course: z.string().min(1, 'Required'),
  batch: z.string().optional(),
  joiningDate: z.string().optional(),
  courseStartDate: z.string().optional(),
  courseEndDate: z.string().optional(),
  trainingStatus: z.enum(['ENROLLED', 'ACTIVE', 'COMPLETED', 'DROPPED', 'ON_HOLD']),
  studentType: z.enum(['FRESHER', 'EXPERIENCED']),
  lastCompany: z.string().optional(),
  totalYearsExperience: z.number().optional(),
  pfStatus: z.enum(['YES', 'NO', '']).optional(),
  workHistory: z.array(
    z.object({
      company: z.string().min(1, 'Company name required'),
      role: z.string().optional(),
      years: z.number().optional(),
    }),
  ),
});

type FormValues = z.infer<typeof schema>;

export function StudentFormPage({ studentId }: { studentId?: string }) {
  const isEdit = !!studentId;
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: student, isLoading: loadingStudent } = useQuery({
    queryKey: ['students', studentId],
    queryFn: () => studentsApi.getById(studentId!),
    enabled: isEdit,
  });
  const { data: courses } = useQuery({ queryKey: ['courses', 'active'], queryFn: coursesApi.listActive });
  const { data: batches } = useQuery({ queryKey: ['batches', 'active'], queryFn: batchesApi.listActive });

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: student
      ? {
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          mobile: student.mobile,
          alternateMobile: student.alternateMobile || '',
          gender: student.gender || '',
          dob: student.dob?.slice(0, 10) || '',
          address: student.address || '',
          city: student.city || '',
          state: student.state || '',
          country: student.country || '',
          pincode: student.pincode || '',
          highestQualification: student.highestQualification || '',
          college: student.college || '',
          university: student.university || '',
          graduationYear: student.graduationYear,
          percentage: student.percentage,
          skills: student.skills?.join(', ') || '',
          course: typeof student.course === 'string' ? student.course : student.course._id,
          batch: student.batch ? (typeof student.batch === 'string' ? student.batch : student.batch._id) : '',
          joiningDate: student.joiningDate?.slice(0, 10) || '',
          courseStartDate: student.courseStartDate?.slice(0, 10) || '',
          courseEndDate: student.courseEndDate?.slice(0, 10) || '',
          trainingStatus: student.trainingStatus,
          studentType: student.studentType || 'FRESHER',
          lastCompany: student.lastCompany || '',
          totalYearsExperience: student.totalYearsExperience,
          pfStatus: student.pfStatus === undefined ? '' : student.pfStatus ? 'YES' : 'NO',
          workHistory: student.workHistory?.length
            ? student.workHistory.map((w) => ({ company: w.company, role: w.role || '', years: w.years }))
            : [],
        }
      : {
          firstName: '',
          lastName: '',
          email: '',
          mobile: '',
          course: '',
          trainingStatus: 'ENROLLED',
          studentType: 'FRESHER',
          workHistory: [],
        },
  });

  const studentType = watch('studentType');
  const { fields: workFields, append: appendWork, remove: removeWork } = useFieldArray({
    control,
    name: 'workHistory',
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const isExperienced = values.studentType === 'EXPERIENCED';
      const payload = {
        ...values,
        gender: values.gender || undefined,
        batch: values.batch || undefined,
        skills: values.skills
          ? values.skills.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        lastCompany: isExperienced ? values.lastCompany || undefined : undefined,
        totalYearsExperience: isExperienced ? values.totalYearsExperience : undefined,
        pfStatus: isExperienced && values.pfStatus ? values.pfStatus === 'YES' : undefined,
        workHistory: isExperienced
          ? values.workHistory.filter((w) => w.company.trim())
          : [],
      };
      return isEdit ? studentsApi.update(studentId!, payload) : studentsApi.create(payload);
    },
    onSuccess: (result) => {
      toast.success(isEdit ? 'Student updated' : 'Student created');
      queryClient.invalidateQueries({ queryKey: ['students'] });
      router.push(`/students/${result._id}`);
    },
    onError: (err) => toast.error('Could not save student', getErrorMessage(err)),
  });

  if (isEdit && loadingStudent) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardBody className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink/80"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <h1 className="font-display text-xl font-semibold text-ink">
        {isEdit ? 'Edit Student' : 'Add Student'}
      </h1>

      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="First Name" htmlFor="firstName" error={errors.firstName?.message} required>
              <Input id="firstName" {...register('firstName')} />
            </Field>
            <Field label="Last Name" htmlFor="lastName" error={errors.lastName?.message} required>
              <Input id="lastName" {...register('lastName')} />
            </Field>
            <Field label="Email" htmlFor="email" error={errors.email?.message} required>
              <Input id="email" type="email" {...register('email')} />
            </Field>
            <Field label="Mobile" htmlFor="mobile" error={errors.mobile?.message} required>
              <Input id="mobile" {...register('mobile')} />
            </Field>
            <Field label="Alternate Mobile" htmlFor="alternateMobile">
              <Input id="alternateMobile" {...register('alternateMobile')} />
            </Field>
            <Field label="Date of Birth" htmlFor="dob">
              <Input id="dob" type="date" {...register('dob')} />
            </Field>
            <Field label="Gender" htmlFor="gender">
              <Select id="gender" {...register('gender')}>
                <option value="">Select</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </Select>
            </Field>
            <Field label="City" htmlFor="city">
              <Input id="city" {...register('city')} />
            </Field>
            <Field label="State" htmlFor="state">
              <Input id="state" {...register('state')} />
            </Field>
            <Field label="Country" htmlFor="country">
              <Input id="country" {...register('country')} />
            </Field>
            <Field label="Pincode" htmlFor="pincode">
              <Input id="pincode" {...register('pincode')} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Address" htmlFor="address">
                <Input id="address" {...register('address')} />
              </Field>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Education</CardTitle>
          </CardHeader>
          <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Highest Qualification" htmlFor="highestQualification">
              <Input id="highestQualification" {...register('highestQualification')} />
            </Field>
            <Field label="College" htmlFor="college">
              <Input id="college" {...register('college')} />
            </Field>
            <Field label="University" htmlFor="university">
              <Input id="university" {...register('university')} />
            </Field>
            <Field label="Graduation Year" htmlFor="graduationYear">
              <Input id="graduationYear" type="number" {...register('graduationYear', { valueAsNumber: true })} />
            </Field>
            <Field label="Percentage / CGPA" htmlFor="percentage">
              <Input id="percentage" type="number" step="0.01" {...register('percentage', { valueAsNumber: true })} />
            </Field>
            <Field label="Skills (comma separated)" htmlFor="skills">
              <Input id="skills" placeholder="React, Node.js, MongoDB" {...register('skills')} />
            </Field>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Experience</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <Field label="Student Type" htmlFor="studentType" required>
              <Select id="studentType" {...register('studentType')}>
                <option value="FRESHER">Fresher</option>
                <option value="EXPERIENCED">Experienced</option>
              </Select>
            </Field>

            {studentType === 'EXPERIENCED' && (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Field label="Last Company" htmlFor="lastCompany">
                    <Input id="lastCompany" {...register('lastCompany')} />
                  </Field>
                  <Field label="Total Experience (years)" htmlFor="totalYearsExperience">
                    <Input
                      id="totalYearsExperience"
                      type="number"
                      step="0.5"
                      min={0}
                      {...register('totalYearsExperience', { valueAsNumber: true })}
                    />
                  </Field>
                  <Field label="PF Status" htmlFor="pfStatus">
                    <Select id="pfStatus" {...register('pfStatus')}>
                      <option value="">Not specified</option>
                      <option value="YES">Yes</option>
                      <option value="NO">No</option>
                    </Select>
                  </Field>
                </div>

                <div>
                  <p className="mb-1.5 text-sm font-medium text-ink/80">Companies Worked</p>
                  <div className="space-y-2">
                    {workFields.map((field, index) => (
                      <div key={field.id} className="grid grid-cols-1 gap-2 rounded-xl border border-black/[0.06] p-3 sm:grid-cols-[1fr_1fr_100px_auto]">
                        <Input
                          placeholder="Company name"
                          {...register(`workHistory.${index}.company` as const)}
                        />
                        <Input placeholder="Role" {...register(`workHistory.${index}.role` as const)} />
                        <Input
                          placeholder="Years"
                          type="number"
                          step="0.5"
                          min={0}
                          {...register(`workHistory.${index}.years` as const, { valueAsNumber: true })}
                        />
                        <button
                          type="button"
                          onClick={() => removeWork(index)}
                          className="flex items-center justify-center rounded-lg p-2 text-ink/40 hover:bg-red-50 hover:text-red-600"
                          aria-label={`Remove company ${index + 1}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendWork({ company: '', role: '', years: undefined })}
                    >
                      <Plus className="h-4 w-4" /> Add Company
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
          </CardHeader>
          <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Course" htmlFor="course" error={errors.course?.message} required>
              <Select id="course" {...register('course')}>
                <option value="">Select course</option>
                {courses?.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Batch" htmlFor="batch">
              <Select id="batch" {...register('batch')}>
                <option value="">Unassigned</option>
                {batches?.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Joining Date" htmlFor="joiningDate">
              <Input id="joiningDate" type="date" {...register('joiningDate')} />
            </Field>
            <Field label="Training Status" htmlFor="trainingStatus">
              <Select id="trainingStatus" {...register('trainingStatus')}>
                <option value="ENROLLED">Enrolled</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="DROPPED">Dropped</option>
                <option value="ON_HOLD">On Hold</option>
              </Select>
            </Field>
            <Field label="Course Start Date" htmlFor="courseStartDate">
              <Input id="courseStartDate" type="date" {...register('courseStartDate')} />
            </Field>
            <Field label="Course End Date" htmlFor="courseEndDate">
              <Input id="courseEndDate" type="date" {...register('courseEndDate')} />
            </Field>
          </CardBody>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            {isEdit ? 'Save Changes' : 'Create Student'}
          </Button>
        </div>
      </form>
    </div>
  );
}

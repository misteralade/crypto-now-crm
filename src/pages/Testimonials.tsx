import { useMemo } from 'react';
import { useTestimonialPage } from "../hooks/pages/useTestimonialPage";
import { TestimonialDataColumn, TestimonialDataRow } from "../components/tables/TestimonialsTable";
import Table from "../components/table";
import TableFooter from "../components/tables/TableFooter";
import PageHeader from '../components/global/pageHeader';
import AuthenticatedLayout from "../layout/AuthenticatedLayout";
import ConfirmModal from "../components/global/ConfirmModal";
import TestimonialFormModal from "../components/pages/testimonials/TestimonialFormModal";
import type { TestimonialResponsePayload } from "../types/response.payload.types";
import type { UpdateTestimonialRequestType } from "../schemas/testimonial.schema";

const Testimonials = () => {
  const {
    // 🧩 Values
    testimonials,
    loadingTestimonials,
    isCreateModalOpen,
    isEditModalOpen,
    isDeleteModalOpen,

    // ⚙️ Functions
    openCreateModal,
    closeCreateModal,
    handleCreateTestimonialFieldChange,
    handleCreateTestimonial,
    
    openEditModal,
    closeEditModal,
    handleUpdateTestimonialFieldChange,
    handleUpdateTestimonial,
    
    openDeleteModal,
    closeDeleteModal,
    handleDeleteTestimonial,
    
    handleTogglePublishStatus,
    handlePageChange,
    handlePageSizeChange,
  } = useTestimonialPage();

  const handleEdit = (testimonial: TestimonialResponsePayload) => {
    const updateData: UpdateTestimonialRequestType = {
      contentLink: testimonial.contentLink,
      name: testimonial.name || undefined,
      description: testimonial.description || undefined,
      contentType: testimonial.contentType,
      isPublished: testimonial.isPublished,
    };
    openEditModal(testimonial.id, updateData);
  };

  const columns = useMemo(
    () =>
      TestimonialDataColumn(
        handleEdit,
        openDeleteModal,
        handleTogglePublishStatus,
      ),
    [handleEdit, openDeleteModal, handleTogglePublishStatus],
  );

  const data = useMemo(
    () => TestimonialDataRow(!loadingTestimonials ? testimonials?.testimonials : []),
    [loadingTestimonials, testimonials?.testimonials],
  );

  return (
    <AuthenticatedLayout>
      <PageHeader 
        title="Testimonials" 
        actions={
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            Add Testimonial
          </button>
        }
      />
      
      <div className="px-4 sm:px-6 pb-6 space-y-4">
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <Table data={data} columns={columns} loading={loadingTestimonials} />
          
          <TableFooter
            currentPage={testimonials?.page || 1}
            totalPages={testimonials?.totalPages || 1}
            pageSize={testimonials?.limit || 10}
            totalItems={testimonials?.count || 0}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
        
        {/* Create Testimonial Modal */}
        <TestimonialFormModal
          open={isCreateModalOpen}
          mode="create"
          onClose={closeCreateModal}
          onSubmit={(values) => {
            // Update Redux state with form values
            Object.entries(values).forEach(([key, value]) => {
              handleCreateTestimonialFieldChange(key as any, value);
            });
            handleCreateTestimonial();
          }}
        />
        
        {/* Edit Testimonial Modal */}
        <TestimonialFormModal
          open={isEditModalOpen}
          mode="edit"
          onClose={closeEditModal}
          onSubmit={(values) => {
            // Update Redux state with form values
            Object.entries(values).forEach(([key, value]) => {
              handleUpdateTestimonialFieldChange(key as any, value);
            });
            handleUpdateTestimonial();
          }}
        />
        
        {/* Delete Confirmation Modal */}
        <ConfirmModal
          open={isDeleteModalOpen}
          actionType="delete"
          onClose={closeDeleteModal}
          onConfirm={handleDeleteTestimonial}
          message="Are you sure you want to delete this testimonial? This action cannot be undone."
          confirmText="Delete Testimonial"
        />
      </div>
    </AuthenticatedLayout>
  );
};

export default Testimonials;


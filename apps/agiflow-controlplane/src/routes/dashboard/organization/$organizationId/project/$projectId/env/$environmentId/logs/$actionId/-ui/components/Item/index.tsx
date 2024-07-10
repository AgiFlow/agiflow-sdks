export const InlineItem = ({ label, value }: { label: string; value?: any }) => {
  if (!value && value !== 0) return null;
  return (
    <>
      &#x2022;
      <div className='inline-flex gap-2'>
        <label className='text-xs font-bold'>{label}:</label>
        <p className='flex-1 text-wrap break-all text-xs'>{value}</p>
      </div>
    </>
  );
};

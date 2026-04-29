// apps/academia/src/app/(trilhas)/trilhas/[slug]/[modulo]/[licao]/loading.tsx

const skeletonStyle = {
  backgroundColor: 'var(--colheita-surface-card)',
  borderRadius: 'var(--colheita-radius-sm)',
};

export default function LicaoLoading() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 32px' }}>
      {/* Breadcrumb skeleton — widths: trilhas, ›, track, ›, modulo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '32px',
        }}
      >
        <div style={{ ...skeletonStyle, height: '13px', width: '80px' }} />
        <div style={{ ...skeletonStyle, height: '13px', width: '20px' }} />
        <div style={{ ...skeletonStyle, height: '13px', width: '120px' }} />
        <div style={{ ...skeletonStyle, height: '13px', width: '20px' }} />
        <div style={{ ...skeletonStyle, height: '13px', width: '100px' }} />
      </div>

      {/* Lesson header */}
      <div style={{ marginBottom: '40px' }}>
        {/* type + duration row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '12px',
          }}
        >
          <div style={{ ...skeletonStyle, height: '12px', width: '60px' }} />
          <div style={{ ...skeletonStyle, height: '12px', width: '48px' }} />
        </div>
        {/* Title */}
        <div
          style={{
            ...skeletonStyle,
            height: '36px',
            width: '80%',
            borderRadius: 'var(--colheita-radius-md)',
            marginBottom: '8px',
          }}
        />
        <div
          style={{
            ...skeletonStyle,
            height: '36px',
            width: '55%',
            borderRadius: 'var(--colheita-radius-md)',
          }}
        />
      </div>

      {/* Content skeleton — simulate article paragraphs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ ...skeletonStyle, height: '15px', width: '100%' }} />
        <div style={{ ...skeletonStyle, height: '15px', width: '95%' }} />
        <div style={{ ...skeletonStyle, height: '15px', width: '88%' }} />
        <div style={{ ...skeletonStyle, height: '15px', width: '100%', marginTop: '12px' }} />
        <div style={{ ...skeletonStyle, height: '15px', width: '72%' }} />
        <div style={{ ...skeletonStyle, height: '15px', width: '91%' }} />
        <div style={{ ...skeletonStyle, height: '15px', width: '85%' }} />
        <div style={{ ...skeletonStyle, height: '15px', width: '100%', marginTop: '12px' }} />
        <div style={{ ...skeletonStyle, height: '15px', width: '60%' }} />
      </div>

      {/* Prev/next nav skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginTop: '48px',
        }}
      >
        <div
          style={{
            height: '64px',
            backgroundColor: 'var(--colheita-surface-card)',
            borderRadius: 'var(--colheita-radius-md)',
            border: '1px solid var(--colheita-border-subtle)',
          }}
        />
        <div
          style={{
            height: '64px',
            backgroundColor: 'var(--colheita-surface-card)',
            borderRadius: 'var(--colheita-radius-md)',
            border: '1px solid var(--colheita-border-subtle)',
          }}
        />
      </div>

      {/* Action bar skeleton */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: '1px solid var(--colheita-border-subtle)',
        }}
      >
        <div style={{ ...skeletonStyle, height: '14px', width: '120px' }} />
        <div
          style={{
            height: '36px',
            width: '160px',
            backgroundColor: 'var(--colheita-surface-card)',
            borderRadius: 'var(--colheita-radius-md)',
          }}
        />
      </div>
    </div>
  );
}

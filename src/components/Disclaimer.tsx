export function Disclaimer() {
  return (
    <div className="rounded-xl border border-sd-sky-light/50 bg-sd-sky-pale/40 p-5 text-sm text-sd-text-muted">
      <p className="mb-2 font-semibold text-sd-navy">About this estimate</p>
      <p className="leading-relaxed">
        This is an approximation. Your actual tax allocation depends on your Tax Rate
        Area, voter-approved bonds, and Mello-Roos assessments. The 18% city
        share and proportional department allocation are estimates based on
        publicly available data.
      </p>
      <p className="mt-3 text-xs text-sd-text-muted/70">
        Data sources:{" "}
        <a
          href="https://data.sandiego.gov"
          className="text-sd-blue underline decoration-sd-blue/30 hover:text-sd-navy"
          target="_blank"
          rel="noopener noreferrer"
        >
          San Diego Open Data Portal
        </a>
        {" | "}
        <a
          href="https://www.sandiego.gov/finance/budget"
          className="text-sd-blue underline decoration-sd-blue/30 hover:text-sd-navy"
          target="_blank"
          rel="noopener noreferrer"
        >
          City of San Diego Budget
        </a>
      </p>
    </div>
  );
}

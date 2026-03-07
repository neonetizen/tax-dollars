export function Disclaimer() {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
      <p className="mb-2 font-semibold">Disclaimer</p>
      <p>
        This is an estimate. Your actual tax allocation depends on your Tax Rate
        Area, voter-approved bonds, and Mello-Roos assessments. The 18% city
        share and proportional department allocation are approximations based on
        publicly available data.
      </p>
      <p className="mt-2 text-xs text-amber-600">
        Data sources:{" "}
        <a
          href="https://data.sandiego.gov"
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          San Diego Open Data Portal
        </a>
        {" | "}
        <a
          href="https://www.sandiego.gov/finance/budget"
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          City of San Diego Budget
        </a>
      </p>
    </div>
  );
}

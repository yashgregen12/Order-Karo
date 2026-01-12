import React, { useState, useEffect } from "react";
import Card from "./Card";
import Button from "./Button";

function FilterGroup({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function FilterBar({ filters, onFilterChange, className = "" }) {
  const [draft, setDraft] = useState(filters);

  // Sync draft if external filters change (e.g. on reset or mount)
  useEffect(() => {
    setDraft(filters);
  }, [filters]);

  const handleChange = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onFilterChange(draft);
  };

  const handleReset = () => {
    const resetFilters = Object.fromEntries(
      Object.entries(filters).map(([key, config]) => {
        if (key === "search") {
          return [
            key,
            typeof config === "string" ? "" : { ...config, value: "" },
          ];
        }
        return [
          key,
          {
            ...config,
            value: "",
            min: "",
            max: "",
            start: "",
            end: "",
          },
        ];
      })
    );
    setDraft(resetFilters);
    onFilterChange(resetFilters);
  };

  const hasChanges = JSON.stringify(draft) !== JSON.stringify(filters);

  return (
    <Card className={`${className}`}>
      <div className="space-y-6">
        {/* Search input with icon */}
        <div className="flex gap-3">
          <div className="relative group flex-1">
            <input
              type="text"
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-100/50 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 outline-none placeholder:text-gray-400"
              placeholder="Search across all fields..."
              value={
                typeof draft.search === "string"
                  ? draft.search
                  : draft.search?.value || ""
              }
              onChange={(e) => {
                if (typeof draft.search === "string") {
                  handleChange("search", e.target.value);
                } else {
                  handleChange("search", {
                    ...draft.search,
                    value: e.target.value,
                  });
                }
              }}
              onKeyDown={(e) => e.key === "Enter" && handleApply()}
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-200"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <Button onClick={handleApply} className="px-6 h-[52px]">
            Filter
          </Button>
        </div>

        {/* Filter groups */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(draft)
            .filter(([key]) => key !== "search" && draft[key]?.type)
            .map(([key, config]) => (
              <FilterGroup key={key} label={config.label}>
                {config.type === "select" ? (
                  <select
                    className="w-full h-11 bg-white border border-gray-200 rounded-lg px-3 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none appearance-none"
                    value={config.value || ""}
                    onChange={(e) =>
                      handleChange(key, { ...config, value: e.target.value })
                    }
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: `right 0.5rem center`,
                      backgroundRepeat: `no-repeat`,
                      backgroundSize: `1.5em 1.5em`,
                      paddingRight: `2.5rem`,
                    }}
                  >
                    <option value="">{config.placeholder || "All"}</option>
                    {config.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : config.type === "range" || config.type === "daterange" ? (
                  <div className="flex gap-2 items-center">
                    <input
                      type={config.type === "range" ? "number" : "date"}
                      className="w-full h-11 bg-white border border-gray-200 rounded-lg px-3 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                      placeholder={
                        config.minPlaceholder ||
                        (config.type === "range" ? "Min" : "Start")
                      }
                      value={
                        (config.type === "range" ? config.min : config.start) ||
                        ""
                      }
                      onChange={(e) =>
                        handleChange(key, {
                          ...config,
                          [config.type === "range" ? "min" : "start"]:
                            e.target.value,
                        })
                      }
                    />
                    <span className="text-gray-300">/</span>
                    <input
                      type={config.type === "range" ? "number" : "date"}
                      className="w-full h-11 bg-white border border-gray-200 rounded-lg px-3 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                      placeholder={
                        config.maxPlaceholder ||
                        (config.type === "range" ? "Max" : "End")
                      }
                      value={
                        (config.type === "range" ? config.max : config.end) ||
                        ""
                      }
                      onChange={(e) =>
                        handleChange(key, {
                          ...config,
                          [config.type === "range" ? "max" : "end"]:
                            e.target.value,
                        })
                      }
                    />
                  </div>
                ) : null}
              </FilterGroup>
            ))}
        </div>

        {/* Reset button */}
        {(hasChanges ||
          Object.values(filters).some((f) => {
            if (typeof f === "string") return f !== "";
            return f.value || f.min || f.max || f.start || f.end;
          })) && (
          <div className="flex justify-end pt-2 border-t border-gray-50">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-gray-400 hover:text-red-500 underline decoration-dotted"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Reset to Defaults
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

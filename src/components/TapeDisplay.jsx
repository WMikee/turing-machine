import React from "react";

export default function TapeDisplay({
  cinta = [],
  cabezal = 0,
  blankSymbol = "_",
}) {
  const cellWidth = 60;
  const separatorWidth = 2;
  const headExtra = 10;
  const step = cellWidth + separatorWidth;

  const offsetX = cabezal * step;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#f0f0f0",
        padding: "20px 0",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "10px",
          width: "100%",
          backgroundImage:
            "repeating-linear-gradient(to right, #555 0px, #555 10px, transparent 10px, transparent 20px)",
          marginBottom: "8px",
        }}
      />

      <div style={{ position: "relative", overflow: "hidden", width: "100%" }}>
        <div
          style={{
            position: "absolute",
            top: -headExtra,
            left: "50%",
            transform: "translateX(-50%)",
            width: `${cellWidth + headExtra * 2}px`,
            height: `${60 + headExtra * 2}px`,
            border: "4px solid #111",
            borderRadius: "6px",
            boxSizing: "border-box",
            pointerEvents: "none",
            zIndex: 10,
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            transform: `translateX(calc(50% - ${cellWidth / 2}px - ${offsetX}px))`,
            transition: "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
            willChange: "transform",
          }}
        >
          {cinta.map((simbolo, index) => (
            <React.Fragment key={index}>
              <div
                style={{
                  width: `${cellWidth}px`,
                  height: "60px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "black",
                  fontSize: "28px",
                  boxSizing: "border-box",
                  flexShrink: 0,
                }}
              >
                {simbolo || blankSymbol}
              </div>

              {index !== cinta.length - 1 && (
                <div
                  style={{
                    width: `${separatorWidth}px`,
                    height: "60px",
                    backgroundImage:
                      "repeating-linear-gradient(to bottom, #555 0px, #555 6px, transparent 6px, transparent 12px)",
                    flexShrink: 0,
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div
        style={{
          height: "10px",
          width: "100%",
          backgroundImage:
            "repeating-linear-gradient(to right, #555 0px, #555 10px, transparent 10px, transparent 20px)",
          marginTop: "8px",
        }}
      />
    </div>
  );
}

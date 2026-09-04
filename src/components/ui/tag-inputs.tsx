"use client";
import type { FC, KeyboardEvent } from "react";

import { CircleXmarkFill } from "@gravity-ui/icons";
import { Chip, Input, Label } from "@heroui/react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";

interface TagInputsProps {
  value: string[];
  onChange: (value: string[]) => void;
}

const MotionChip = motion.create(Chip);

const TagInputs: FC<TagInputsProps> = ({ value = [], onChange }) => {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = useCallback(
    (text: string) => {
      const val = text.trim();

      if (val && !value.includes(val)) {
        onChange?.([...value, val]);
      }
      setInputValue("");
    },
    [value, onChange],
  );

  const removeTag = useCallback(
    (text: string) => {
      onChange?.(value.filter((tag) => tag !== text));
    },
    [value, onChange],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addTag(inputValue);
      } else if (e.key === "Backspace" && inputValue === "" && value.length) {
        e.preventDefault();
        onChange?.(value.slice(0, -1));
      }
    },
    [addTag, inputValue, value, onChange],
  );

  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor="tags">标签</Label>
      <div className="flex flex-wrap items-center gap-2 px-2 py-2 border rounded-lg border-default bg-transparent">
        <AnimatePresence>
          {value.map((tag) => (
            <MotionChip
              key={tag}
              layout
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              exit={{ opacity: 0, filter: "blur(2px)", y: 10 }}
              initial={{ opacity: 0, filter: "blur(2px)", y: 10 }}
              size="sm"
              transition={{ duration: 0.2 }}
              variant="soft"
            >
              <Chip.Label>{tag}</Chip.Label>
              <CircleXmarkFill
                className="cursor-pointer"
                onClick={() => removeTag(tag)}
              />
            </MotionChip>
          ))}
        </AnimatePresence>
        <Input
          ref={inputRef}
          className="w-25 text-xs py-1"
          placeholder="回车添加"
          value={inputValue}
          variant="secondary"
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
};

export default TagInputs;

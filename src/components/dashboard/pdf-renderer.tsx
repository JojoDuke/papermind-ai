"use client";

import {
  ChevronDown,
  ChevronUp,
  Loader2,
  RotateCw,
  Search,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useToast } from "../ui/use-toast";

import { useResizeDetector } from "react-resize-detector";
import { useState, useEffect } from "react";

import { useForm } from "react-hook-form";
import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import SimpleBar from "simplebar-react";

import { Button } from "../ui/button";
import { Input } from "../ui/input";

import PdfFullscreen from "./pdf-fullscreen";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface PdfRendererProps {
  url: string;
}

const PdfRenderer = ({ url }: PdfRendererProps) => {
  const { toast } = useToast();

  const [numPages, setNumPages] = useState<number>();
  const [currPage, setCurrPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [renderedScale, setRenderedScale] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Check if viewing on a mobile device
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  const isLoading = renderedScale !== scale;

  const CustomPageValidator = z.object({
    page: z
      .string()
      .refine((num) => Number(num) > 0 && Number(num) <= numPages!),
  });

  type TCustomPageValidator = z.infer<typeof CustomPageValidator>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<TCustomPageValidator>({
    defaultValues: {
      page: "1",
    },
    resolver: zodResolver(CustomPageValidator),
  });

  const { width, ref } = useResizeDetector();

  const handlePageSubmit = ({ page }: TCustomPageValidator) => {
    setCurrPage(Number(page));
    setValue("page", String(page));
  };

  const nextPage = () => {
    if (numPages && currPage < numPages) {
      setCurrPage(prevPage => prevPage + 1);
      setValue("page", String(currPage + 1));
    }
  };

  const prevPage = () => {
    if (currPage > 1) {
      setCurrPage(prevPage => prevPage - 1);
      setValue("page", String(currPage - 1));
    }
  };

  const zoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.25, 3));
  };

  const zoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.25, 0.5));
  };

  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center h-full">
      <div className="w-full border-b border-zinc-200 flex flex-wrap items-center justify-between p-2">
        {/* Page Navigation */}
        <div className="flex items-center gap-1 justify-start">
          <Button
            disabled={currPage <= 1}
            onClick={prevPage}
            variant="ghost"
            size="sm"
            aria-label="previous page"
            className="h-8 w-8 p-0"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1">
            <Input
              {...register("page")}
              className={cn(
                "w-8 h-7 text-sm px-1",
                errors.page && "focus-visible:ring-red-500"
              )}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit(handlePageSubmit)();
                }
              }}
            />
            <p className="text-zinc-700 text-xs whitespace-nowrap">
              <span>/</span>
              <span>{numPages ?? "x"}</span>
            </p>
          </div>

          <Button
            disabled={numPages === undefined || currPage === numPages}
            onClick={nextPage}
            variant="ghost"
            size="sm"
            aria-label="next page"
            className="h-8 w-8 p-0"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          {/* Mobile Zoom Buttons */}
          <div className="flex items-center gap-1 sm:hidden">
            <Button
              onClick={zoomOut}
              variant="ghost"
              size="sm"
              aria-label="zoom out"
              className="h-7 w-7 p-0"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <span className="flex items-center text-xs font-medium w-10 text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button
              onClick={zoomIn}
              variant="ghost"
              size="sm"
              aria-label="zoom in"
              className="h-7 w-7 p-0"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Desktop Zoom Dropdown */}
          <div className="hidden sm:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="gap-1.5 text-xs h-8" aria-label="zoom" variant="ghost">
                  <Search className="h-3 w-3" />
                  {Math.round(scale * 100)}%
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => setScale(0.5)}>
                  50%
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setScale(0.75)}>
                  75%
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setScale(1)}>
                  100%
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setScale(1.5)}>
                  150%
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setScale(2)}>
                  200%
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setScale(2.5)}>
                  250%
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Button
            onClick={() => setRotation((prev) => prev + 90)}
            variant="ghost"
            size="sm"
            aria-label="rotate 90 degrees"
            className="h-7 w-7 p-0"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </Button>

          <PdfFullscreen fileUrl={url} />
        </div>
      </div>

      <div className="flex-1 w-full max-h-full overflow-auto">
        <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)]">
          <div ref={ref} className="px-2">
            <Document
              loading={
                <div className="flex justify-center">
                  <Loader2 className="my-24 h-6 w-6 animate-spin" />
                </div>
              }
              onLoadError={() => {
                toast({
                  title: "Error loading PDF",
                  description: "Please try again later",
                  variant: "destructive",
                });
              }}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              file={url}
              className="max-h-full"
            >
              {isLoading && renderedScale ? (
                <Page
                  width={width ? width : 1}
                  pageNumber={currPage}
                  scale={isMobile ? Math.min(scale, 1.5) : scale}
                  rotate={rotation}
                  key={"@" + renderedScale}
                />
              ) : null}

              <Page
                className={cn(isLoading ? "hidden" : "")}
                width={width ? width : 1}
                pageNumber={currPage}
                scale={isMobile ? Math.min(scale, 1.5) : scale}
                rotate={rotation}
                key={"@" + scale}
                loading={
                  <div className="flex justify-center">
                    <Loader2 className="my-24 h-6 w-6 animate-spin" />
                  </div>
                }
                onRenderSuccess={() => setRenderedScale(scale)}
              />
            </Document>
          </div>
        </SimpleBar>
      </div>
    </div>
  );
};

export default PdfRenderer;

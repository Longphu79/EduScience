"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Accordion,
  ActionIcon,
  Alert,
  AspectRatio,
  Badge,
  Button,
  Checkbox,
  Divider,
  Drawer,
  Grid,
  Group,
  Loader,
  Modal,
  NumberInput,
  Pagination,
  Paper,
  Progress,
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Tabs,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { RichTextEditor } from "@mantine/tiptap";
import {
  IconBook2,
  IconCircleCheck,
  IconChevronDown,
  IconExternalLink,
  IconFileUpload,
  IconPencil,
  IconPlus,
  IconTrash,
  IconVideo,
} from "@tabler/icons-react";
import StarterKit from "@tiptap/starter-kit";
import { useEditor } from "@tiptap/react";
import { Dropzone } from "@mantine/dropzone";

import {
  backendBrowserApiFetch,
  backendBrowserDelete,
  backendBrowserPostJson,
  backendBrowserPutJson,
  backendBrowserUploadFormData,
} from "@/lib/web-api";
import { formatCurrency, formatDateTime } from "@/lib/format";

const LEVEL_OPTIONS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const LANGUAGE_OPTIONS = [
  { value: "vi", label: "Tiếng Việt" },
  { value: "en", label: "English" },
];

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

const STATUS_META = {
  published: {
    label: "Published",
    color: "green",
    helper: "Live on the public catalog and ready for student QA.",
  },
  draft: {
    label: "Draft",
    color: "blue",
    helper: "Private until the instructor or admin publishes the course.",
  },
  archived: {
    label: "Archived",
    color: "gray",
    helper: "Hidden from discovery while staying available for internal review.",
  },
};

const COURSE_FILTER_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

const LESSON_STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All publish states" },
  { value: "published", label: "Published only" },
  { value: "draft", label: "Draft only" },
];

const LESSON_ACCESS_FILTER_OPTIONS = [
  { value: "all", label: "All access modes" },
  { value: "preview", label: "Preview lessons" },
  { value: "locked", label: "Sequential unlock" },
];

const LESSON_BULK_ACTION_OPTIONS = [
  { value: "publish", label: "Publish selected" },
  { value: "draft", label: "Move to draft" },
  { value: "delete", label: "Delete selected" },
];

const PAGE_SIZE_OPTIONS = [
  { value: "5", label: "5 / page" },
  { value: "10", label: "10 / page" },
  { value: "20", label: "20 / page" },
];

const DEFAULT_COURSE_FORM = {
  title: "",
  slug: "",
  shortDescription: "",
  description: "",
  category: "",
  instructorId: "",
  level: "beginner",
  language: "vi",
  duration: 0,
  price: 0,
  salePrice: 0,
  status: "draft",
  isPopular: false,
  isFree: false,
  thumbnail: "",
  previewVideo: "",
};

const DEFAULT_LESSON_FORM = {
  title: "",
  description: "",
  videoUrl: "",
  thumbnail: "",
  duration: 10,
  estimatedCompletionMinutes: 10,
  order: 1,
  isPreview: false,
  isPublished: true,
  objectivesText: "",
  notes: "",
  generatedThumbnail: "",
};

const slugify = (value = "") =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const normalizeNumber = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const splitLines = (value = "") =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

const joinLines = (items = []) => items.filter(Boolean).join("\n");

const buildCourseForm = (course = {}) => ({
  title: course.title || "",
  slug: course.slug || "",
  shortDescription: course.shortDescription || "",
  description: course.description || "",
  category: course.category || "",
  instructorId: course.instructorId?._id || course.instructorId || "",
  level: course.level || "beginner",
  language: course.language || "vi",
  duration: normalizeNumber(course.duration),
  price: normalizeNumber(course.price),
  salePrice: normalizeNumber(course.salePrice),
  status: course.status || "draft",
  isPopular: Boolean(course.isPopular),
  isFree: Boolean(course.isFree),
  thumbnail: course.thumbnail || "",
  previewVideo: course.previewVideo || "",
});

const buildLessonForm = (lesson = {}, fallbackOrder = 1) => ({
  title: lesson.title || "",
  description: lesson.description || "",
  videoUrl: lesson.videoUrl || "",
  thumbnail: lesson.thumbnail || lesson.generatedThumbnail || "",
  duration: normalizeNumber(lesson.duration) || 10,
  estimatedCompletionMinutes:
    normalizeNumber(lesson.estimatedCompletionMinutes) ||
    normalizeNumber(lesson.duration) ||
    10,
  order: normalizeNumber(lesson.order) || fallbackOrder,
  isPreview: Boolean(lesson.isPreview),
  isPublished: lesson.isPublished !== false,
  objectivesText: joinLines(lesson.objectives || []),
  notes: lesson.notes || "",
  generatedThumbnail: lesson.generatedThumbnail || lesson.thumbnail || "",
});

const buildCoursePayload = (form, role) => ({
  title: form.title.trim(),
  slug: slugify(form.slug || form.title),
  shortDescription: form.shortDescription.trim(),
  description: form.description.trim(),
  category: form.category.trim(),
  level: form.level,
  language: form.language,
  duration: normalizeNumber(form.duration),
  price: form.isFree ? 0 : normalizeNumber(form.price),
  salePrice: form.isFree ? 0 : normalizeNumber(form.salePrice),
  status: form.status,
  isPopular: Boolean(form.isPopular),
  isFree: Boolean(form.isFree),
  thumbnail: form.thumbnail.trim() || undefined,
  previewVideo: form.previewVideo.trim() || undefined,
  ...(role === "admin" ? { instructorId: form.instructorId } : {}),
});

const buildLessonPayload = (form, courseId) => ({
  courseId,
  title: form.title.trim(),
  description: form.description.trim(),
  videoUrl: form.videoUrl.trim(),
  thumbnail: form.generatedThumbnail?.trim() || form.thumbnail?.trim() || undefined,
  duration: normalizeNumber(form.duration),
  estimatedCompletionMinutes:
    normalizeNumber(form.estimatedCompletionMinutes) ||
    normalizeNumber(form.duration),
  order: normalizeNumber(form.order),
  isPreview: Boolean(form.isPreview),
  isPublished: Boolean(form.isPublished),
  objectives: splitLines(form.objectivesText),
  notes: form.notes.trim(),
});

const getVideoDurationFromFile = (file) =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement("video");

    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(Math.max(1, Math.ceil(video.duration / 60)));
    };
    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Unable to read video duration"));
    };

    video.src = objectUrl;
  });

const createThumbnailFromVideo = (file) =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement("video");

    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    video.onloadeddata = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("Unable to create canvas context");
        }

        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);

            if (!blob) {
              reject(new Error("Unable to capture video thumbnail"));
              return;
            }

            resolve(blob);
          },
          "image/jpeg",
          0.86,
        );
      } catch (error) {
        URL.revokeObjectURL(objectUrl);
        reject(error);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Unable to read video frame"));
    };

    video.src = objectUrl;
  });

function RichDescriptionField({ value, onChange }) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit],
    content: value || "<p></p>",
    onUpdate: ({ editor: activeEditor }) => {
      onChange(activeEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const nextValue = value || "<p></p>";
    if (editor.getHTML() !== nextValue) {
      editor.commands.setContent(nextValue, false);
    }
  }, [editor, value]);

  return (
    <Stack gap={6}>
      <Text fw={500} size="sm">
        Long description
      </Text>
      <RichTextEditor editor={editor}>
        <RichTextEditor.Toolbar sticky stickyOffset={0}>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.ClearFormatting />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.H1 />
            <RichTextEditor.H2 />
            <RichTextEditor.H3 />
            <RichTextEditor.BulletList />
            <RichTextEditor.OrderedList />
          </RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>
        <RichTextEditor.Content
          aria-label="Long description"
          data-testid="course-description-editor"
          style={{ minHeight: 220, borderRadius: "var(--mantine-radius-md)" }}
        />
      </RichTextEditor>
    </Stack>
  );
}

function CourseFormFields({
  form,
  onChange,
  isAdmin,
  instructorOptions,
  loadingInstructors,
  uploadingField,
  uploadProgress,
  slugEditedManually,
  setSlugEditedManually,
  computedDurationLabel = "Auto-calculated from lessons after upload",
}) {
  return (
    <Stack gap="md">
      {isAdmin ? (
        <Select
          label="Instructor owner"
          radius="md"
          placeholder={loadingInstructors ? "Loading instructors..." : "Select instructor"}
          data={instructorOptions.map((option) => ({
            value: option._id,
            label: option.username ? `${option.name} (@${option.username})` : option.name,
          }))}
          value={form.instructorId}
          onChange={(value) => onChange("instructorId", value || "")}
          searchable
          nothingFoundMessage="No instructor found"
          required
        />
      ) : null}

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <TextInput
          label="Course title"
          radius="md"
          value={form.title}
          onChange={(event) => {
            const { value } = event.currentTarget;
            onChange("title", value);
            if (!slugEditedManually) {
              onChange("slug", slugify(value));
            }
          }}
          required
        />
        <TextInput
          label="Slug"
          radius="md"
          placeholder="Public URL slug"
          value={form.slug}
          onChange={(event) => {
            const { value } = event.currentTarget;
            setSlugEditedManually(true);
            onChange("slug", value);
          }}
          required
        />
      </SimpleGrid>

      <Textarea
        label="Short description"
        radius="md"
        minRows={3}
        value={form.shortDescription}
        onChange={(event) => {
          const { value } = event.currentTarget;
          onChange("shortDescription", value);
        }}
        required
      />

      <RichDescriptionField value={form.description} onChange={(value) => onChange("description", value)} />

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
        <TextInput
          label="Category"
          radius="md"
          value={form.category}
          onChange={(event) => {
            const { value } = event.currentTarget;
            onChange("category", value);
          }}
        />
        <Select
          label="Level"
          radius="md"
          data={LEVEL_OPTIONS}
          value={form.level}
          onChange={(value) => onChange("level", value || "beginner")}
        />
        <Select
          label="Language"
          radius="md"
          data={LANGUAGE_OPTIONS}
          value={form.language}
          onChange={(value) => onChange("language", value || "vi")}
        />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
        <Select
          label="Status"
          radius="md"
          data={STATUS_OPTIONS}
          value={form.status}
          onChange={(value) => onChange("status", value || "draft")}
        />
        <NumberInput
          label="Price"
          radius="md"
          min={0}
          value={form.price}
          disabled={form.isFree}
          onChange={(value) => onChange("price", normalizeNumber(value))}
        />
        <NumberInput
          label="Sale price"
          radius="md"
          min={0}
          value={form.salePrice}
          disabled={form.isFree}
          onChange={(value) => onChange("salePrice", normalizeNumber(value))}
        />
      </SimpleGrid>

      <Group gap="xl" wrap="wrap">
        <Checkbox
          label="Free course"
          checked={form.isFree}
          onChange={(event) => onChange("isFree", event.currentTarget.checked)}
        />
        <Checkbox
          label="Feature as popular"
          checked={form.isPopular}
          onChange={(event) => onChange("isPopular", event.currentTarget.checked)}
        />
      </Group>

      <Paper radius="md" p="md" withBorder style={{ background: "#f8fafc" }}>
        <Group justify="space-between" wrap="wrap">
          <div>
            <Text fw={700}>Course duration</Text>
            <Text c="dimmed" size="sm" mt={4}>
              {computedDurationLabel}
            </Text>
          </div>
          <Badge color="blue" variant="light">
            {form.duration || 0} minutes
          </Badge>
        </Group>
      </Paper>

      <Accordion variant="separated" radius="md" defaultValue="media">
        <Accordion.Item value="media">
          <Accordion.Control icon={<IconChevronDown size={16} />}>
            Media upload
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="md">
              <Paper radius="md" p="md" withBorder style={{ background: "#fbfdff" }}>
                <Text fw={600}>Automatic media</Text>
                <Text c="dimmed" size="sm" mt={4}>
                  Không cần điền thumbnail URL hay upload preview riêng. Khi upload lesson video và
                  đánh dấu lesson là preview, hệ thống sẽ tự lấy frame video làm thumbnail và tự
                  gán preview video cho course.
                </Text>
              </Paper>
              {form.thumbnail ? (
                <AspectRatio ratio={16 / 9}>
                  <img
                    src={form.thumbnail}
                    alt="Course thumbnail"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "var(--mantine-radius-md)",
                    }}
                  />
                </AspectRatio>
              ) : null}
              {form.previewVideo ? (
                <video
                  src={form.previewVideo}
                  controls
                  style={{
                    width: "100%",
                    borderRadius: "var(--mantine-radius-md)",
                    background: "#020617",
                  }}
                />
              ) : null}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Stack>
  );
}

function LessonFormFields({
  form,
  onChange,
  uploadingField,
  uploadProgress,
  onUploadVideo,
}) {
  const videoReady = Boolean(form.videoUrl);
  const thumbnailReady = Boolean(form.generatedThumbnail);

  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
        <Paper radius="md" p="md" withBorder style={{ background: "#eef6ff" }}>
          <Text c="dimmed" size="sm">
            Video status
          </Text>
          <Title order={4} mt="xs">
            {videoReady ? "Uploaded" : "Pending"}
          </Title>
          <Text c="dimmed" size="sm" mt="xs">
            Lesson video is the single source for playback, preview, and thumbnail generation.
          </Text>
        </Paper>
        <Paper radius="md" p="md" withBorder style={{ background: "#f2fbf5" }}>
          <Text c="dimmed" size="sm">
            Unlock mode
          </Text>
          <Title order={4} mt="xs">
            {form.isPreview ? "Preview lesson" : "Sequential unlock"}
          </Title>
          <Text c="dimmed" size="sm" mt="xs">
            Preview lessons feed the public course trailer. Others unlock by learner progress.
          </Text>
        </Paper>
        <Paper radius="md" p="md" withBorder style={{ background: "#f6f8fc" }}>
          <Text c="dimmed" size="sm">
            Auto duration
          </Text>
          <Title order={4} mt="xs">
            {form.duration || 0} minutes
          </Title>
          <Text c="dimmed" size="sm" mt="xs">
            Duration and completion time are read from the uploaded video metadata.
          </Text>
        </Paper>
      </SimpleGrid>

      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, lg: 7 }}>
          <Stack gap="lg">
            <Paper radius="md" p="lg" withBorder>
              <Stack gap="md">
                <Group gap="sm">
                  <ThemeIcon size={40} radius="md" variant="light" color="blue">
                    <IconVideo size={20} />
                  </ThemeIcon>
                  <div>
                    <Text fw={700}>Lesson media</Text>
                    <Text c="dimmed" size="sm">
                      Upload one lesson video. Preview video and thumbnail are derived automatically.
                    </Text>
                  </div>
                </Group>

                <Dropzone
                  onDrop={(files) => onUploadVideo(files[0])}
                  accept={["video/mp4", "video/webm"]}
                  maxFiles={1}
                  multiple={false}
                  loading={uploadingField === "lessonVideo"}
                  radius="md"
                  p="xl"
                  styles={{
                    root: {
                      border: "1px dashed #9ec5fe",
                      background: "#f8fbff",
                    },
                  }}
                >
                  <Group justify="center" gap="md" wrap="nowrap">
                    <ThemeIcon size={46} radius="md" variant="light" color="blue">
                      <IconFileUpload size={22} />
                    </ThemeIcon>
                    <div>
                      <Text fw={700}>Drop lesson video here or click to upload</Text>
                      <Text c="dimmed" size="sm" mt={4}>
                        MP4 or WEBM. The system extracts duration and creates a thumbnail frame.
                      </Text>
                    </div>
                  </Group>
                </Dropzone>

                {uploadingField === "lessonVideo" ? (
                  <Stack gap={6}>
                    <Progress value={uploadProgress.lessonVideo || 0} color="blue" radius="xl" />
                    <Text size="sm" c="dimmed">
                      Uploading lesson video... {uploadProgress.lessonVideo || 0}%
                    </Text>
                    {(uploadProgress.thumbnail || 0) > 0 ? (
                      <>
                        <Progress value={uploadProgress.thumbnail || 0} color="cyan" radius="xl" />
                        <Text size="sm" c="dimmed">
                          Extracting thumbnail... {uploadProgress.thumbnail || 0}%
                        </Text>
                      </>
                    ) : null}
                  </Stack>
                ) : null}

                <TextInput
                  label="Lesson video URL"
                  radius="md"
                  value={form.videoUrl}
                  onChange={(event) => {
                    const { value } = event.currentTarget;
                    onChange("videoUrl", value);
                  }}
                  required
                />

                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                  <Paper radius="md" p="md" withBorder style={{ background: "#fbfdff" }}>
                    <Text fw={700}>Video preview</Text>
                    <Text c="dimmed" size="sm" mt={4}>
                      What learners will see in the lesson player.
                    </Text>
                    {videoReady ? (
                      <video
                        src={form.videoUrl}
                        controls
                        poster={form.generatedThumbnail || undefined}
                        style={{
                          width: "100%",
                          marginTop: 16,
                          borderRadius: "var(--mantine-radius-md)",
                          background: "#020617",
                        }}
                      />
                    ) : (
                      <Paper
                        radius="md"
                        p="xl"
                        mt="md"
                        withBorder
                        style={{ background: "#f8fafc", textAlign: "center" }}
                      >
                        <Text c="dimmed" size="sm">
                          Upload a video to see the lesson preview.
                        </Text>
                      </Paper>
                    )}
                  </Paper>

                  <Paper radius="md" p="md" withBorder style={{ background: "#fbfdff" }}>
                    <Text fw={700}>Thumbnail frame</Text>
                    <Text c="dimmed" size="sm" mt={4}>
                      Auto-generated and reused for preview surfaces when the lesson is public preview.
                    </Text>
                    {thumbnailReady ? (
                      <AspectRatio ratio={16 / 9} mt="md">
                        <img
                          src={form.generatedThumbnail}
                          alt="Lesson thumbnail"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "var(--mantine-radius-md)",
                          }}
                        />
                      </AspectRatio>
                    ) : (
                      <Paper
                        radius="md"
                        p="xl"
                        mt="md"
                        withBorder
                        style={{ background: "#f8fafc", textAlign: "center" }}
                      >
                        <Text c="dimmed" size="sm">
                          Thumbnail appears automatically after a successful video upload.
                        </Text>
                      </Paper>
                    )}
                  </Paper>
                </SimpleGrid>
              </Stack>
            </Paper>

            <Paper radius="md" p="lg" withBorder>
              <Stack gap="md">
                <Text fw={700}>Learning outcomes</Text>
                <Text c="dimmed" size="sm">
                  One objective per line. These outcomes help students understand what unlocks next.
                </Text>
                <Textarea
                  label="Objectives (one per line)"
                  radius="md"
                  minRows={5}
                  value={form.objectivesText}
                  onChange={(event) => {
                    const { value } = event.currentTarget;
                    onChange("objectivesText", value);
                  }}
                />
              </Stack>
            </Paper>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 5 }}>
          <Stack gap="lg">
            <Paper radius="md" p="lg" withBorder>
              <Stack gap="md">
                <Text fw={700}>Lesson metadata</Text>
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                  <TextInput
                    label="Lesson title"
                    radius="md"
                    value={form.title}
                    onChange={(event) => {
                      const { value } = event.currentTarget;
                      onChange("title", value);
                    }}
                    required
                  />
                  <NumberInput
                    label="Lesson order"
                    radius="md"
                    min={1}
                    value={form.order}
                    onChange={(value) => onChange("order", normalizeNumber(value) || 1)}
                    required
                  />
                </SimpleGrid>

                <Textarea
                  label="Lesson summary"
                  radius="md"
                  minRows={5}
                  value={form.description}
                  onChange={(event) => {
                    const { value } = event.currentTarget;
                    onChange("description", value);
                  }}
                />
              </Stack>
            </Paper>

            <Paper radius="md" p="lg" withBorder>
              <Stack gap="md">
                <Text fw={700}>Publishing & access</Text>
                <Checkbox
                  label="Preview lesson"
                  checked={form.isPreview}
                  onChange={(event) => onChange("isPreview", event.currentTarget.checked)}
                />
                <Checkbox
                  label="Published"
                  checked={form.isPublished}
                  onChange={(event) => onChange("isPublished", event.currentTarget.checked)}
                />
                <Divider />
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                  <Paper radius="md" p="md" withBorder style={{ background: "#f8fafc" }}>
                    <Text fw={700}>Estimated completion</Text>
                    <Badge color="blue" variant="light" mt="md">
                      {form.estimatedCompletionMinutes || 0} minutes
                    </Badge>
                  </Paper>
                  <Paper radius="md" p="md" withBorder style={{ background: "#f8fafc" }}>
                    <Text fw={700}>Comment gate</Text>
                    <Badge color="dark" variant="light" mt="md">
                      Unlock after previous lesson
                    </Badge>
                  </Paper>
                </SimpleGrid>
              </Stack>
            </Paper>

            <Paper radius="md" p="lg" withBorder>
              <Stack gap="md">
                <Text fw={700}>Instructor notes</Text>
                <Text c="dimmed" size="sm">
                  Internal notes for teaching handoff, QA, and lesson maintenance.
                </Text>
                <Textarea
                  label="Instructor notes"
                  radius="md"
                  minRows={8}
                  value={form.notes}
                  onChange={(event) => {
                    const { value } = event.currentTarget;
                    onChange("notes", value);
                  }}
                />
              </Stack>
            </Paper>
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}

export function CourseAuthoringWorkspace({ role }) {
  const isAdmin = role === "admin";
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [instructorOptions, setInstructorOptions] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingInstructors, setLoadingInstructors] = useState(false);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState("10");

  const [createOpened, setCreateOpened] = useState(false);
  const [createSaving, setCreateSaving] = useState(false);
  const [createForm, setCreateForm] = useState(DEFAULT_COURSE_FORM);
  const [createSlugEditedManually, setCreateSlugEditedManually] = useState(false);

  const [editorOpened, setEditorOpened] = useState(false);
  const [editorLoading, setEditorLoading] = useState(false);
  const [editorSaving, setEditorSaving] = useState(false);
  const [editorTab, setEditorTab] = useState("details");
  const [editingCourse, setEditingCourse] = useState(null);
  const [editorForm, setEditorForm] = useState(DEFAULT_COURSE_FORM);
  const [editSlugEditedManually, setEditSlugEditedManually] = useState(true);
  const [lessons, setLessons] = useState([]);

  const [lessonModalOpened, setLessonModalOpened] = useState(false);
  const [lessonSaving, setLessonSaving] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [lessonForm, setLessonForm] = useState(DEFAULT_LESSON_FORM);
  const [lessonQuery, setLessonQuery] = useState("");
  const [lessonStatusFilter, setLessonStatusFilter] = useState("all");
  const [lessonAccessFilter, setLessonAccessFilter] = useState("all");
  const [lessonBulkAction, setLessonBulkAction] = useState("publish");
  const [lessonPage, setLessonPage] = useState(1);
  const [lessonPageSize, setLessonPageSize] = useState("5");
  const [selectedLessonIds, setSelectedLessonIds] = useState([]);
  const [uploadingField, setUploadingField] = useState("");
  const [uploadProgress, setUploadProgress] = useState({
    thumbnail: 0,
    lessonVideo: 0,
  });

  const coursesEndpoint = isAdmin ? "/api/admin/courses" : "/api/instructor/courses";

  const totals = useMemo(
    () =>
      courses.reduce(
        (acc, course) => {
          acc.total += 1;
          acc.totalLessons += course.totalLessons || 0;
          acc.totalEnrollments += course.totalEnrollments || 0;
          acc.catalogValue += course.salePrice ?? course.price ?? 0;
          acc[course.status] = (acc[course.status] || 0) + 1;
          return acc;
        },
        {
          total: 0,
          published: 0,
          draft: 0,
          archived: 0,
          totalLessons: 0,
          totalEnrollments: 0,
          catalogValue: 0,
        },
      ),
    [courses],
  );

  const filteredCourses = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return courses.filter((course) => {
      const matchesStatus = statusFilter === "all" || course.status === statusFilter;
      if (!matchesStatus) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = [
        course.title,
        course.slug,
        course.category,
        course.instructorId?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [courses, searchQuery, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCourses.length / (Number(pageSize) || 10)),
  );
  const pagedCourses = useMemo(() => {
    const numericPageSize = Number(pageSize) || 10;
    const start = (page - 1) * numericPageSize;
    return filteredCourses.slice(start, start + numericPageSize);
  }, [filteredCourses, page, pageSize]);

  const currentStatus = STATUS_META[editorForm.status] || STATUS_META.draft;
  const canViewPublicPage =
    editingCourse?.status === "published" && Boolean(editingCourse?.slug);
  const totalLessonDuration = useMemo(
    () =>
      lessons.reduce(
        (sum, lesson) => sum + (Number.isFinite(Number(lesson.duration)) ? Number(lesson.duration) : 0),
        0,
      ),
    [lessons],
  );
  const filteredLessons = useMemo(() => {
    const normalizedQuery = lessonQuery.trim().toLowerCase();

    return lessons.filter((lesson) => {
      const matchesStatus =
        lessonStatusFilter === "all" ||
        (lessonStatusFilter === "published" ? lesson.isPublished : !lesson.isPublished);
      const matchesAccess =
        lessonAccessFilter === "all" ||
        (lessonAccessFilter === "preview" ? lesson.isPreview : !lesson.isPreview);

      if (!matchesStatus || !matchesAccess) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = [
        lesson.title,
        lesson.description,
        lesson.notes,
        String(lesson.order || ""),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [lessonAccessFilter, lessonQuery, lessonStatusFilter, lessons]);
  const lessonTotalPages = Math.max(
    1,
    Math.ceil(filteredLessons.length / (Number(lessonPageSize) || 5)),
  );
  const pagedLessons = useMemo(() => {
    const numericPageSize = Number(lessonPageSize) || 5;
    const start = (lessonPage - 1) * numericPageSize;
    return filteredLessons.slice(start, start + numericPageSize);
  }, [filteredLessons, lessonPage, lessonPageSize]);
  const visibleLessonIds = pagedLessons.map((lesson) => lesson._id);
  const allVisibleLessonsSelected =
    visibleLessonIds.length > 0 &&
    visibleLessonIds.every((lessonId) => selectedLessonIds.includes(lessonId));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    if (lessonPage > lessonTotalPages) {
      setLessonPage(lessonTotalPages);
    }
  }, [lessonPage, lessonTotalPages]);

  useEffect(() => {
    setSelectedLessonIds((previous) =>
      previous.filter((lessonId) => lessons.some((lesson) => lesson._id === lessonId)),
    );
  }, [lessons]);

  const loadCourses = async () => {
    setLoadingCourses(true);
    try {
      const payload = await backendBrowserApiFetch(coursesEndpoint);
      setCourses(Array.isArray(payload) ? payload : []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoadingCourses(false);
    }
  };

  const loadInstructorOptions = async () => {
    if (!isAdmin) {
      return;
    }

    setLoadingInstructors(true);
    try {
      const payload = await backendBrowserApiFetch("/user/instructors/options");
      setInstructorOptions(Array.isArray(payload) ? payload : []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoadingInstructors(false);
    }
  };

  useEffect(() => {
    loadCourses().catch((loadError) => setError(loadError.message));
    loadInstructorOptions().catch((loadError) => setError(loadError.message));
  }, [coursesEndpoint]);

  const loadCourseWorkspace = async (courseId) => {
    setEditorLoading(true);
    setError("");
    try {
      const [course, courseLessons] = await Promise.all([
        backendBrowserApiFetch(`/course/${courseId}`),
        backendBrowserApiFetch(`/api/lesson/course/${courseId}`),
      ]);

      setEditingCourse(course);
      setEditorForm({
        ...buildCourseForm(course),
        duration: Array.isArray(courseLessons)
          ? courseLessons.reduce(
              (sum, lesson) =>
                sum + (Number.isFinite(Number(lesson.duration)) ? Number(lesson.duration) : 0),
              0,
            )
          : normalizeNumber(course.duration),
      });
      setEditSlugEditedManually(true);
      setLessons(Array.isArray(courseLessons) ? courseLessons : []);
      setLessonQuery("");
      setLessonStatusFilter("all");
      setLessonAccessFilter("all");
      setLessonBulkAction("publish");
      setLessonPage(1);
      setLessonPageSize("5");
      setSelectedLessonIds([]);
      setEditorOpened(true);
      setEditorTab("details");
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setEditorLoading(false);
    }
  };

  useEffect(() => {
    const requestedCourseId = searchParams.get("courseId");

    if (!requestedCourseId || loadingCourses || editorLoading || editingCourse?._id === requestedCourseId) {
      return;
    }

    loadCourseWorkspace(requestedCourseId).catch((loadError) => setError(loadError.message));
  }, [searchParams, loadingCourses, editorLoading, editingCourse?._id]);

  useEffect(() => {
    if (!editorOpened) {
      return;
    }

    setEditorForm((previous) =>
      previous.duration === totalLessonDuration
        ? previous
        : { ...previous, duration: totalLessonDuration },
    );
  }, [editorOpened, totalLessonDuration]);

  const updateCreateField = (field, value) => {
    setCreateForm((previous) => ({ ...previous, [field]: value }));
  };

  const updateEditorField = (field, value) => {
    setEditorForm((previous) => ({ ...previous, [field]: value }));
  };

  const updateLessonField = (field, value) => {
    setLessonForm((previous) => ({ ...previous, [field]: value }));
  };

  const validateCourseForm = (form) => {
    if (!form.title.trim()) {
      throw new Error("Course title is required");
    }

    if (!form.shortDescription.trim()) {
      throw new Error("Short description is required");
    }

    if (!slugify(form.slug || form.title)) {
      throw new Error("Slug is required");
    }

    if (!form.isFree && normalizeNumber(form.salePrice) > normalizeNumber(form.price)) {
      throw new Error("Sale price cannot exceed the base price");
    }

    if (isAdmin && !form.instructorId) {
      throw new Error("Assign an instructor owner before saving");
    }
  };

  const validateLessonForm = (form) => {
    if (!form.title.trim()) {
      throw new Error("Lesson title is required");
    }

    if (!form.videoUrl.trim()) {
      throw new Error("Lesson video URL is required");
    }

    if (normalizeNumber(form.order) <= 0) {
      throw new Error("Lesson order must be at least 1");
    }
  };

  const openCreateModal = () => {
    setCreateForm(DEFAULT_COURSE_FORM);
    setCreateSlugEditedManually(false);
    setCreateOpened(true);
  };

  const openLessonModal = (lesson = null) => {
    setEditingLessonId(lesson?._id || null);
    setLessonForm(
      lesson
        ? buildLessonForm(lesson)
        : buildLessonForm({}, lessons.length + 1),
    );
    setLessonModalOpened(true);
  };

  const resetEditor = () => {
    setEditorOpened(false);
    setEditingCourse(null);
    setEditorForm(DEFAULT_COURSE_FORM);
    setLessons([]);
    setLessonModalOpened(false);
    setEditingLessonId(null);
    setLessonForm(DEFAULT_LESSON_FORM);
    setLessonQuery("");
    setLessonStatusFilter("all");
    setLessonAccessFilter("all");
    setLessonBulkAction("publish");
    setLessonPage(1);
    setLessonPageSize("5");
    setSelectedLessonIds([]);
    setUploadProgress({
      thumbnail: 0,
      lessonVideo: 0,
    });
  };

  const uploadLessonVideo = async (file) => {
    if (!file) {
      return;
    }

    setUploadingField("lessonVideo");
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const duration = await getVideoDurationFromFile(file);
      const thumbnailBlob = await createThumbnailFromVideo(file);
      const response = await backendBrowserUploadFormData("/api/upload/lesson-video", formData, {
        onProgress: (value) =>
          setUploadProgress((previous) => ({ ...previous, lessonVideo: value })),
      });
      const thumbnailFormData = new FormData();
      thumbnailFormData.append(
        "file",
        new File([thumbnailBlob], `${file.name.replace(/\.[^/.]+$/, "") || "lesson"}-thumbnail.jpg`, {
          type: "image/jpeg",
        }),
      );
      const thumbnailUpload = await backendBrowserUploadFormData(
        "/api/upload/course-thumbnail",
        thumbnailFormData,
        {
          onProgress: (value) =>
            setUploadProgress((previous) => ({ ...previous, thumbnail: value })),
        },
      );
      updateLessonField("videoUrl", response.url || "");
      updateLessonField("duration", duration);
      updateLessonField("estimatedCompletionMinutes", duration);
      updateLessonField("thumbnail", thumbnailUpload.url || "");
      updateLessonField("generatedThumbnail", thumbnailUpload.url || "");
      notifications.show({
        color: "blue",
        title: "Lesson video uploaded",
        message: `Video uploaded to R2. Duration set to ${duration} minutes and thumbnail extracted automatically.`,
      });
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setUploadingField("");
      setUploadProgress((previous) => ({ ...previous, lessonVideo: 0, thumbnail: 0 }));
    }
  };

  const handleCreateCourse = async () => {
    setCreateSaving(true);
    setError("");

    try {
      validateCourseForm(createForm);
      const savedCourse = await backendBrowserPostJson(
        "/course",
        buildCoursePayload(createForm, role),
      );

      notifications.show({
        color: "green",
        title: "Course created",
        message: "Course saved. Continue immediately with lesson authoring in the drawer.",
      });

      setCreateOpened(false);
      await loadCourses();
      await loadCourseWorkspace(savedCourse._id);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setCreateSaving(false);
    }
  };

  const handleSaveCourse = async () => {
    if (!editingCourse?._id) {
      return;
    }

    setEditorSaving(true);
    setError("");

    try {
      validateCourseForm(editorForm);
      const savedCourse = await backendBrowserPutJson(
        `/course/${editingCourse._id}`,
        buildCoursePayload({ ...editorForm, duration: totalLessonDuration }, role),
      );
      setEditingCourse(savedCourse);
      setEditorForm(buildCourseForm(savedCourse));
      setEditSlugEditedManually(true);
      await loadCourses();
      notifications.show({
        color: "green",
        title: "Course updated",
        message: "Course details and visibility are up to date.",
      });
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setEditorSaving(false);
    }
  };

  const syncPreviewFromLesson = async (lesson, generatedThumbnail) => {
    if (!editingCourse?._id || !lesson?.isPreview || !lesson.videoUrl) {
      return;
    }

    const updatedCourse = await backendBrowserPutJson(`/course/${editingCourse._id}`, {
      previewVideo: lesson.videoUrl,
      ...(generatedThumbnail ? { thumbnail: generatedThumbnail } : {}),
    });

    setEditingCourse(updatedCourse);
    setEditorForm(buildCourseForm(updatedCourse));
    setEditSlugEditedManually(true);
    await loadCourses();
  };

  const handleSaveLesson = async () => {
    if (!editingCourse?._id) {
      return;
    }

    setLessonSaving(true);
    setError("");

    try {
      validateLessonForm(lessonForm);
      const payload = buildLessonPayload(lessonForm, editingCourse._id);
      const savedLesson = editingLessonId
        ? await backendBrowserPutJson(`/api/lesson/${editingLessonId}`, payload)
        : await backendBrowserPostJson("/api/lesson", payload);

      await syncPreviewFromLesson(savedLesson, lessonForm.generatedThumbnail);
      await loadCourseWorkspace(editingCourse._id);
      setLessonModalOpened(false);
      setEditingLessonId(null);
      setLessonForm(DEFAULT_LESSON_FORM);
      setEditorTab("lessons");
      notifications.show({
        color: "green",
        title: editingLessonId ? "Lesson updated" : "Lesson created",
        message:
          editingLessonId
            ? "Lesson data is saved and visible in the course plan."
            : "Lesson added. The next lesson can now be created from the same drawer.",
      });
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setLessonSaving(false);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!editingCourse?._id) {
      return;
    }

    if (typeof window !== "undefined" && !window.confirm("Delete this lesson?")) {
      return;
    }

    setError("");

    try {
      await backendBrowserDelete(`/api/lesson/${lessonId}`);
      await loadCourseWorkspace(editingCourse._id);
      await loadCourses();
      notifications.show({
        color: "green",
        title: "Lesson deleted",
        message: "The lesson has been removed from the course plan.",
      });
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  const toggleSelectVisibleLessons = (checked) => {
    setSelectedLessonIds((previous) => {
      const next = new Set(previous);

      visibleLessonIds.forEach((lessonId) => {
        if (checked) {
          next.add(lessonId);
        } else {
          next.delete(lessonId);
        }
      });

      return Array.from(next);
    });
  };

  const toggleSelectLesson = (lessonId, checked) => {
    setSelectedLessonIds((previous) => {
      const next = new Set(previous);

      if (checked) {
        next.add(lessonId);
      } else {
        next.delete(lessonId);
      }

      return Array.from(next);
    });
  };

  const applyLessonBulkAction = async () => {
    if (!editingCourse?._id || selectedLessonIds.length === 0) {
      return;
    }

    if (
      lessonBulkAction === "delete" &&
      typeof window !== "undefined" &&
      !window.confirm(`Delete ${selectedLessonIds.length} selected lessons?`)
    ) {
      return;
    }

    setLessonSaving(true);
    setError("");

    try {
      if (lessonBulkAction === "delete") {
        await Promise.all(
          selectedLessonIds.map((lessonId) => backendBrowserDelete(`/api/lesson/${lessonId}`)),
        );
      } else {
        const lessonsToUpdate = lessons.filter((lesson) => selectedLessonIds.includes(lesson._id));
        await Promise.all(
          lessonsToUpdate.map((lesson) =>
            backendBrowserPutJson(`/api/lesson/${lesson._id}`, {
              ...buildLessonPayload(buildLessonForm(lesson), editingCourse._id),
              isPublished: lessonBulkAction === "publish",
            }),
          ),
        );
      }

      await loadCourseWorkspace(editingCourse._id);
      await loadCourses();
      setSelectedLessonIds([]);
      notifications.show({
        color: "green",
        title: "Lessons updated",
        message:
          lessonBulkAction === "delete"
            ? "Selected lessons were removed from this course."
            : `Selected lessons were moved to ${lessonBulkAction === "publish" ? "published" : "draft"} state.`,
      });
    } catch (bulkError) {
      setError(bulkError.message);
    } finally {
      setLessonSaving(false);
    }
  };

  const summaryCards = [
    {
      label: "Total courses",
      value: totals.total,
      tone: "rgba(228, 242, 255, 0.95)",
    },
    {
      label: "Published",
      value: totals.published,
      tone: "rgba(230, 250, 239, 0.95)",
    },
    {
      label: "Draft",
      value: totals.draft,
      tone: "rgba(235, 243, 255, 0.95)",
    },
    {
      label: "Lessons live",
      value: totals.totalLessons,
      tone: "rgba(238, 245, 255, 0.95)",
    },
  ];

  return (
    <>
      <Stack gap="lg" className="management-page">
        <Paper radius="md" p="xl" className="management-panel management-panel--soft">
          <Group justify="space-between" align="flex-start" wrap="wrap" gap="lg">
            <div>
              <Badge color="blue" variant="light" w="fit-content">
                {isAdmin ? "Admin authoring" : "Instructor authoring"}
              </Badge>
              <Title order={1} mt="md">
                Course authoring
              </Title>
              <Text c="dimmed" mt="sm" maw={900}>
                Build courses in two steps: create the course shell first, then open the drawer to
                manage lessons, upload lesson videos to R2, and push preview content to the public page.
              </Text>
            </div>
            <Group gap="sm" wrap="wrap">
              <Button radius="md" leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
                Create course
              </Button>
            </Group>
          </Group>
        </Paper>

        {error ? <Alert color="red">{error}</Alert> : null}

        <SimpleGrid cols={{ base: 1, md: 2, xl: 4 }} spacing="md">
          {summaryCards.map((card) => (
            <Paper key={card.label} className="management-kpi-card" style={{ background: card.tone }}>
              <Text c="dimmed" size="sm">
                {card.label}
              </Text>
              <Title order={2} mt="sm">
                {card.value}
              </Title>
            </Paper>
          ))}
        </SimpleGrid>

        <Paper radius="md" p="xl" className="management-panel">
          <Stack gap="lg">
            <Group justify="space-between" align="center" wrap="wrap">
              <div>
                <Title order={2}>Course inventory</Title>
                <Text c="dimmed" mt="xs">
                  Use the table below to filter, paginate, and open the drawer editor for any course.
                </Text>
              </div>
              <Badge color="blue" variant="light">
                Catalog value: {formatCurrency(totals.catalogValue)}
              </Badge>
            </Group>

            <Group gap="sm" align="end" wrap="wrap">
              <TextInput
                label="Search"
                radius="md"
                placeholder="Search title, slug, category, or owner"
                value={searchQuery}
                onChange={(event) => {
                  const { value } = event.currentTarget;
                  setSearchQuery(value);
                  setPage(1);
                }}
                style={{ flex: "1 1 320px" }}
              />
              <Select
                label="Status"
                radius="md"
                value={statusFilter}
                onChange={(value) => {
                  setStatusFilter(value || "all");
                  setPage(1);
                }}
                data={COURSE_FILTER_OPTIONS}
                w={180}
              />
            </Group>

            <ScrollArea>
              <Table
                highlightOnHover
                verticalSpacing="md"
                horizontalSpacing="lg"
                miw={980}
                styles={{
                  thead: {
                    background: "#f8fafc",
                  },
                  th: {
                    color: "#475569",
                    fontSize: "0.86rem",
                    fontWeight: 700,
                    borderBottom: "1px solid #e6ebf2",
                  },
                  td: {
                    borderBottom: "1px solid #edf2f7",
                  },
                }}
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Course</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Owner</Table.Th>
                    <Table.Th>Stats</Table.Th>
                    <Table.Th>Updated</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {loadingCourses ? (
                    <Table.Tr>
                      <Table.Td colSpan={6}>
                        <Group gap="sm">
                          <Loader size="sm" color="blue" />
                          <Text c="dimmed">Loading course inventory...</Text>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ) : pagedCourses.length > 0 ? (
                    pagedCourses.map((course) => (
                      <Table.Tr key={course._id}>
                        <Table.Td>
                          <Stack gap={2}>
                            <Text fw={700}>{course.title}</Text>
                            <Text size="sm" c="dimmed">
                              /{course.slug}
                            </Text>
                          </Stack>
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            color={(STATUS_META[course.status] || STATUS_META.draft).color}
                            variant="light"
                          >
                            {(STATUS_META[course.status] || STATUS_META.draft).label}
                          </Badge>
                        </Table.Td>
                        <Table.Td>{course.instructorId?.name || "Not assigned"}</Table.Td>
                        <Table.Td>
                          <Stack gap={2}>
                            <Text size="sm">{course.totalLessons || 0} lessons</Text>
                            <Text size="sm" c="dimmed">
                              {course.totalEnrollments || 0} enrollments
                            </Text>
                          </Stack>
                        </Table.Td>
                        <Table.Td>{formatDateTime(course.updatedAt)}</Table.Td>
                        <Table.Td>
                          <Group gap="xs" wrap="nowrap">
                            <ActionIcon
                              size="lg"
                              radius="md"
                              variant="light"
                              color="blue"
                              aria-label="Edit"
                              onClick={() => loadCourseWorkspace(course._id)}
                            >
                              <IconPencil size={16} />
                            </ActionIcon>
                            {course.status === "published" && course.slug ? (
                              <Link href={`/courses/${course.slug}`} target="_blank">
                                <ActionIcon
                                  size="lg"
                                  radius="md"
                                  color="blue"
                                  aria-label="Public"
                                >
                                  <IconExternalLink size={16} />
                                </ActionIcon>
                              </Link>
                            ) : null}
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={6}>
                        <Text c="dimmed">No courses match the current filters.</Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>

            <Group justify="space-between" wrap="wrap">
              <Group gap="sm" align="center">
                <Text c="dimmed" size="sm">
                  Items per page
                </Text>
                <Select
                  aria-label="Items per page"
                  radius="md"
                  value={pageSize}
                  onChange={(value) => {
                    setPageSize(value || "10");
                    setPage(1);
                  }}
                  data={PAGE_SIZE_OPTIONS}
                  w={140}
                />
                <Text c="dimmed" size="sm">
                  Showing {pagedCourses.length === 0 ? 0 : (page - 1) * (Number(pageSize) || 10) + 1}
                  -{Math.min(page * (Number(pageSize) || 10), filteredCourses.length)} of{" "}
                  {filteredCourses.length}
                </Text>
              </Group>
              <Pagination total={totalPages} value={page} onChange={setPage} />
            </Group>
          </Stack>
        </Paper>
      </Stack>

      <Modal
        opened={createOpened}
        onClose={() => setCreateOpened(false)}
        title="Create course"
        size="xl"
        centered
      >
        <Stack gap="lg">
          <Text c="dimmed">
            Save the course shell first. The lesson builder drawer opens right after creation.
          </Text>
          <CourseFormFields
            form={createForm}
            onChange={updateCreateField}
            isAdmin={isAdmin}
            instructorOptions={instructorOptions}
            loadingInstructors={loadingInstructors}
            uploadingField={uploadingField}
            uploadProgress={uploadProgress}
            slugEditedManually={createSlugEditedManually}
            setSlugEditedManually={setCreateSlugEditedManually}
            computedDurationLabel="Auto-calculated after lesson videos are uploaded"
          />
          <Group justify="space-between" align="center">
            <Badge color="blue" variant="outline">
              Step 1 of 2: create course shell
            </Badge>
            <Button radius="md" onClick={handleCreateCourse} loading={createSaving}>
              Create course
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Drawer
        opened={editorOpened}
        onClose={resetEditor}
        size="82%"
        padding="xl"
        position="right"
        closeButtonProps={{ "aria-label": "Close course editor" }}
        title={
          <Group gap="sm" wrap="wrap">
            <ThemeIcon radius="md" variant="light" color="blue">
              <IconBook2 size={18} />
            </ThemeIcon>
            <div>
              <Text fw={700}>{editingCourse?.title || "Course editor"}</Text>
              <Text size="sm" c="dimmed">
                Edit course details, then create and publish lessons.
              </Text>
            </div>
          </Group>
        }
      >
        {editorLoading ? (
          <Stack align="center" py="xl">
            <Loader color="blue" />
            <Text c="dimmed">Loading course workspace...</Text>
          </Stack>
        ) : editingCourse ? (
          <Stack gap="lg">
            <Paper radius="md" p="lg" withBorder>
              <Group justify="space-between" align="flex-start" wrap="wrap" gap="lg">
                <div>
                  <Group gap="xs" wrap="wrap">
                    <Badge color={currentStatus.color} variant="light">
                      {currentStatus.label}
                    </Badge>
                    <Badge color="blue" variant="light">
                      {editingCourse.instructorId?.name || "Instructor owner pending"}
                    </Badge>
                    <Badge color="dark" variant="outline">
                      {lessons.length} lessons
                    </Badge>
                  </Group>
                  <Text c="dimmed" mt="sm" maw={780}>
                    {currentStatus.helper}
                  </Text>
                  {editingCourse.updatedAt ? (
                    <Text c="dimmed" size="sm" mt="sm">
                      Last saved {formatDateTime(editingCourse.updatedAt)}
                    </Text>
                  ) : null}
                </div>
                <Group gap="sm" wrap="wrap">
                  {canViewPublicPage ? (
                    <Link href={`/courses/${editingCourse.slug}`} target="_blank">
                      <Button radius="md" leftSection={<IconExternalLink size={16} />}>
                        View public page
                      </Button>
                    </Link>
                  ) : null}
                  <Button radius="md" variant="light" onClick={handleSaveCourse} loading={editorSaving}>
                    Save course
                  </Button>
                </Group>
              </Group>
            </Paper>

            <Tabs value={editorTab} onChange={setEditorTab}>
              <Tabs.List>
                <Tabs.Tab value="details">Course details</Tabs.Tab>
                <Tabs.Tab value="lessons">Lessons</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="details" pt="lg">
                <Paper radius="md" p="xl" className="management-panel">
                  <Stack gap="lg">
                    <CourseFormFields
                      form={editorForm}
                      onChange={updateEditorField}
                      isAdmin={isAdmin}
                      instructorOptions={instructorOptions}
                      loadingInstructors={loadingInstructors}
                      uploadingField={uploadingField}
                      uploadProgress={uploadProgress}
                      slugEditedManually={editSlugEditedManually}
                      setSlugEditedManually={setEditSlugEditedManually}
                      computedDurationLabel="Auto-calculated from uploaded lesson videos"
                    />
                    <Group justify="space-between" align="center">
                      <Badge color="blue" variant="outline">
                        {formatCurrency(editorForm.salePrice || editorForm.price || 0)} learner price
                      </Badge>
                      <Button radius="md" onClick={handleSaveCourse} loading={editorSaving}>
                        Update course
                      </Button>
                    </Group>
                  </Stack>
                </Paper>
              </Tabs.Panel>

              <Tabs.Panel value="lessons" pt="lg">
                <Paper radius="md" p="xl" className="management-panel">
                  <Stack gap="lg">
                    <Group justify="space-between" align="center" wrap="wrap">
                      <div>
                        <Title order={2}>Lesson planner</Title>
                        <Text c="dimmed" mt="xs">
                          Add lessons in sequence, upload the lesson video, and flag preview lessons.
                        </Text>
                      </div>
                      <Button
                        radius="md"
                        leftSection={<IconPlus size={16} />}
                        onClick={() => openLessonModal()}
                      >
                        Add lesson
                      </Button>
                    </Group>

                    <Group gap="sm" align="end" wrap="wrap">
                      <TextInput
                        label="Search lessons"
                        radius="md"
                        placeholder="Search lesson title, order, summary, or notes"
                        value={lessonQuery}
                        onChange={(event) => {
                          setLessonQuery(event.currentTarget.value);
                          setLessonPage(1);
                        }}
                        style={{ flex: "1 1 320px" }}
                      />
                      <Select
                        label="Publish state"
                        radius="md"
                        value={lessonStatusFilter}
                        onChange={(value) => {
                          setLessonStatusFilter(value || "all");
                          setLessonPage(1);
                        }}
                        data={LESSON_STATUS_FILTER_OPTIONS}
                        w={190}
                      />
                      <Select
                        label="Access mode"
                        radius="md"
                        value={lessonAccessFilter}
                        onChange={(value) => {
                          setLessonAccessFilter(value || "all");
                          setLessonPage(1);
                        }}
                        data={LESSON_ACCESS_FILTER_OPTIONS}
                        w={190}
                      />
                    </Group>

                    <Paper radius="md" p="md" withBorder style={{ background: "#fbfcfe" }}>
                      <Group justify="space-between" align="center" wrap="wrap" gap="md">
                        <Group gap="sm" wrap="wrap">
                          <Badge color="blue" variant="light">
                            {filteredLessons.length} matching lessons
                          </Badge>
                          <Badge color="dark" variant="outline">
                            {selectedLessonIds.length} selected
                          </Badge>
                        </Group>
                        <Group gap="sm" wrap="wrap">
                          <Select
                            aria-label="Lesson bulk action"
                            radius="md"
                            value={lessonBulkAction}
                            onChange={(value) => setLessonBulkAction(value || "publish")}
                            data={LESSON_BULK_ACTION_OPTIONS}
                            w={190}
                          />
                          <Button
                            radius="md"
                            variant="light"
                            disabled={selectedLessonIds.length === 0}
                            loading={lessonSaving}
                            onClick={applyLessonBulkAction}
                          >
                            Apply
                          </Button>
                        </Group>
                      </Group>
                    </Paper>

                    {lessons.length === 0 ? (
                      <Paper radius="md" p="lg" withBorder>
                        <Text c="dimmed">
                          No lessons yet. Create the first lesson now so students have a sequence to unlock.
                        </Text>
                      </Paper>
                    ) : (
                      <ScrollArea>
                        <Table
                          highlightOnHover
                          verticalSpacing="md"
                          horizontalSpacing="lg"
                          miw={1120}
                          styles={{
                            thead: {
                              background: "#f8fafc",
                            },
                            th: {
                              color: "#475569",
                              fontSize: "0.86rem",
                              fontWeight: 700,
                              borderBottom: "1px solid #e6ebf2",
                            },
                            td: {
                              borderBottom: "1px solid #edf2f7",
                            },
                          }}
                        >
                          <Table.Thead>
                            <Table.Tr>
                              <Table.Th w={52}>
                                <Checkbox
                                  aria-label="Select visible lessons"
                                  checked={allVisibleLessonsSelected}
                                  indeterminate={
                                    selectedLessonIds.length > 0 && !allVisibleLessonsSelected
                                  }
                                  onChange={(event) =>
                                    toggleSelectVisibleLessons(event.currentTarget.checked)
                                  }
                                />
                              </Table.Th>
                              <Table.Th>Lesson</Table.Th>
                              <Table.Th>Status</Table.Th>
                              <Table.Th>Video</Table.Th>
                              <Table.Th>Duration</Table.Th>
                              <Table.Th>Updated</Table.Th>
                              <Table.Th>Actions</Table.Th>
                            </Table.Tr>
                          </Table.Thead>
                          <Table.Tbody>
                            {pagedLessons.map((lesson) => (
                              <Table.Tr key={lesson._id}>
                                <Table.Td>
                                  <Checkbox
                                    aria-label={`Select ${lesson.title}`}
                                    checked={selectedLessonIds.includes(lesson._id)}
                                    onChange={(event) =>
                                      toggleSelectLesson(lesson._id, event.currentTarget.checked)
                                    }
                                  />
                                </Table.Td>
                                <Table.Td>
                                  <Stack gap={2}>
                                    <Text fw={700}>
                                      {lesson.order}. {lesson.title}
                                    </Text>
                                    <Text size="sm" c="dimmed">
                                      {lesson.description || "No lesson summary yet."}
                                    </Text>
                                  </Stack>
                                </Table.Td>
                                <Table.Td>
                                  <Group gap="xs" wrap="wrap">
                                    <Badge color={lesson.isPreview ? "blue" : "dark"} variant="light">
                                      {lesson.isPreview ? "Preview" : "Locked until progress"}
                                    </Badge>
                                    <Badge color={lesson.isPublished ? "green" : "gray"} variant="light">
                                      {lesson.isPublished ? "Published" : "Draft"}
                                    </Badge>
                                    {lesson.thumbnail ? (
                                      <Badge color="cyan" variant="light">
                                        Thumbnail ready
                                      </Badge>
                                    ) : null}
                                  </Group>
                                </Table.Td>
                                <Table.Td>
                                  {lesson.videoUrl ? (
                                    <Group gap="xs" wrap="wrap">
                                      <Badge
                                        color="blue"
                                        variant="outline"
                                        leftSection={<IconVideo size={12} />}
                                      >
                                        Video ready
                                      </Badge>
                                      {lesson.thumbnail ? (
                                        <Badge color="cyan" variant="outline">
                                          Poster ready
                                        </Badge>
                                      ) : null}
                                    </Group>
                                  ) : (
                                    <Text c="dimmed" size="sm">
                                      Missing video
                                    </Text>
                                  )}
                                </Table.Td>
                                <Table.Td>
                                  <Stack gap={2}>
                                    <Text size="sm">
                                      {lesson.estimatedCompletionMinutes || lesson.duration || 0} min
                                    </Text>
                                    <Text size="sm" c="dimmed">
                                      Auto-synced
                                    </Text>
                                  </Stack>
                                </Table.Td>
                                <Table.Td>{formatDateTime(lesson.updatedAt)}</Table.Td>
                                <Table.Td>
                                  <Group gap="xs" wrap="nowrap">
                                    <ActionIcon
                                      size="lg"
                                      radius="md"
                                      variant="light"
                                      color="blue"
                                      aria-label="Edit lesson"
                                      onClick={() => openLessonModal(lesson)}
                                    >
                                      <IconPencil size={16} />
                                    </ActionIcon>
                                    <ActionIcon
                                      size="lg"
                                      radius="md"
                                      color="red"
                                      variant="light"
                                      aria-label="Delete lesson"
                                      onClick={() => handleDeleteLesson(lesson._id)}
                                    >
                                      <IconTrash size={16} />
                                    </ActionIcon>
                                  </Group>
                                </Table.Td>
                              </Table.Tr>
                            ))}
                            {pagedLessons.length === 0 ? (
                              <Table.Tr>
                                <Table.Td colSpan={7}>
                                  <Text c="dimmed">No lessons match the current lesson filters.</Text>
                                </Table.Td>
                              </Table.Tr>
                            ) : null}
                          </Table.Tbody>
                        </Table>
                      </ScrollArea>
                    )}

                    {lessons.length > 0 ? (
                      <Group justify="space-between" wrap="wrap">
                        <Group gap="sm" align="center">
                          <Text c="dimmed" size="sm">
                            Items per page
                          </Text>
                          <Select
                            aria-label="Lesson items per page"
                            radius="md"
                            value={lessonPageSize}
                            onChange={(value) => {
                              setLessonPageSize(value || "5");
                              setLessonPage(1);
                            }}
                            data={PAGE_SIZE_OPTIONS}
                            w={140}
                          />
                          <Text c="dimmed" size="sm">
                            Showing{" "}
                            {pagedLessons.length === 0
                              ? 0
                              : (lessonPage - 1) * (Number(lessonPageSize) || 5) + 1}
                            -{Math.min(
                              lessonPage * (Number(lessonPageSize) || 5),
                              filteredLessons.length,
                            )}{" "}
                            of {filteredLessons.length}
                          </Text>
                        </Group>
                        <Pagination
                          total={lessonTotalPages}
                          value={lessonPage}
                          onChange={setLessonPage}
                        />
                      </Group>
                    ) : null}

                    <Paper radius="md" p="lg" withBorder style={{ background: "rgba(34, 139, 230, 0.05)" }}>
                      <Group justify="space-between" align="center" wrap="wrap">
                        <div>
                          <Text fw={700}>Learning rules now expected in the student flow</Text>
                          <Text c="dimmed" mt="xs">
                            Lessons unlock in order, comments belong to unlocked lessons, and preview
                            lessons can push their video into the course preview automatically.
                          </Text>
                        </div>
                        <Badge color="blue" variant="light" leftSection={<IconCircleCheck size={12} />}>
                          Video-first authoring
                        </Badge>
                      </Group>
                    </Paper>
                  </Stack>
                </Paper>
              </Tabs.Panel>
            </Tabs>
          </Stack>
        ) : (
          <Text c="dimmed">Select a course from the inventory first.</Text>
        )}
      </Drawer>

      <Drawer
        opened={editorOpened && lessonModalOpened}
        onClose={() => {
          setLessonModalOpened(false);
          setEditingLessonId(null);
          setLessonForm(DEFAULT_LESSON_FORM);
        }}
        title={
          <Group gap="sm" wrap="wrap">
            <ThemeIcon radius="md" variant="light" color="blue">
              <IconVideo size={18} />
            </ThemeIcon>
            <div>
              <Text fw={700}>{editingLessonId ? "Edit lesson" : "Create lesson"}</Text>
              <Text size="sm" c="dimmed">
                Upload the lesson video, review the thumbnail preview, then publish sequencing rules.
              </Text>
            </div>
          </Group>
        }
        size="68rem"
        padding="xl"
        position="right"
        closeButtonProps={{ "aria-label": "Close lesson editor" }}
      >
        <Stack gap="lg">
          <Paper radius="md" p="lg" withBorder style={{ background: "#fbfcfe" }}>
            <Group justify="space-between" align="center" wrap="wrap">
              <div>
                <Badge color="blue" variant="light">
                  Step 2 of 2
                </Badge>
                <Text fw={700} mt="sm">
                  Lesson sequencing and media setup
                </Text>
                <Text c="dimmed" size="sm" mt={4}>
                  Preview lessons push their video and auto-generated thumbnail into the public
                  course page automatically.
                </Text>
              </div>
              <Badge color="dark" variant="outline">
                Order {lessonForm.order || 1}
              </Badge>
            </Group>
          </Paper>

          <LessonFormFields
            form={lessonForm}
            onChange={updateLessonField}
            uploadingField={uploadingField}
            uploadProgress={uploadProgress}
            onUploadVideo={uploadLessonVideo}
          />
          <Group justify="space-between" align="center">
            <Badge color="blue" variant="outline">
              {lessonForm.isPreview ? "Preview media will sync to course" : "Sequential lesson lock is active"}
            </Badge>
            <Button radius="md" onClick={handleSaveLesson} loading={lessonSaving}>
              {editingLessonId ? "Update lesson" : "Create lesson"}
            </Button>
          </Group>
        </Stack>
      </Drawer>
    </>
  );
}

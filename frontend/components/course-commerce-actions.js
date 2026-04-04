"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Loader,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import {
  IconArrowRight,
  IconHeart,
  IconHeartFilled,
  IconShoppingCart,
  IconShoppingCartFilled,
} from "@tabler/icons-react";

import { useAuth } from "@/components/auth/auth-provider";
import { useStudentCommerce } from "@/components/student-commerce-provider";

export function CourseCommerceActions({ course, variant = "detail" }) {
  const auth = useAuth();
  const commerce = useStudentCommerce();
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const courseId = course?._id;
  const courseTitle = course?.title;
  const inWishlist = commerce.isInWishlist(courseId);
  const inCart = commerce.isInCart(courseId);
  const compact = variant === "card";

  if (auth.loading || (auth.role === "student" && !commerce.loaded && commerce.loading)) {
    return compact ? (
      <Loader size="sm" color="blue" />
    ) : (
      <Group gap="sm">
        <Loader size="sm" color="blue" />
        <Text size="sm" c="dimmed">
          Preparing student actions...
        </Text>
      </Group>
    );
  }

  if (!auth.isAuthenticated) {
    if (compact) {
      return null;
    }

    return (
      <Group gap="sm" wrap="wrap">
        <Link href="/login">
          <Button radius="lg" color="blue" rightSection={<IconArrowRight size={16} />}>
            Log in to save
          </Button>
        </Link>
        <Link href="/register">
          <Button radius="lg" variant="light">
            Create account
          </Button>
        </Link>
      </Group>
    );
  }

  if (auth.role !== "student") {
    if (compact) {
      return null;
    }

    return (
      <Group gap="sm" wrap="wrap">
        <Badge radius="lg" color="blue" variant="light">
          {auth.role} account
        </Badge>
        <Link href={auth.role === "admin" ? "/admin" : "/instructor"}>
          <Button radius="lg" variant="light">
            Open workspace
          </Button>
        </Link>
      </Group>
    );
  }

  if (compact) {
    return (
      <Group gap="xs">
        <Tooltip label={inWishlist ? "Remove from wishlist" : "Save to wishlist"}>
          <ActionIcon
            radius="lg"
            size={42}
            variant={inWishlist ? "filled" : "light"}
            color="blue"
            loading={busy === "wishlist"}
            onClick={async () => {
              setBusy("wishlist");
              try {
                await commerce.toggleWishlist({ courseId, courseTitle });
              } finally {
                setBusy("");
              }
            }}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            {inWishlist ? <IconHeartFilled size={18} /> : <IconHeart size={18} />}
          </ActionIcon>
        </Tooltip>
        <Tooltip label={inCart ? "Open cart" : "Add to cart"}>
          <ActionIcon
            radius="lg"
            size={42}
            variant={inCart ? "filled" : "light"}
            color="blue"
            onClick={async () => {
              setBusy("cart");
              if (inCart) {
                router.push("/cart");
                setBusy("");
                return;
              }

              try {
                await commerce.addToCart({ courseId, courseTitle });
              } finally {
                setBusy("");
              }
            }}
            aria-label={inCart ? "Open cart" : "Add to cart"}
          >
            {inCart ? <IconShoppingCartFilled size={18} /> : <IconShoppingCart size={18} />}
          </ActionIcon>
        </Tooltip>
      </Group>
    );
  }

  return (
    <Stack gap="sm">
      <Group gap="sm" wrap="wrap">
        <Button
          radius="lg"
          variant={inWishlist ? "filled" : "light"}
          color="blue"
          loading={busy === "wishlist"}
          leftSection={inWishlist ? <IconHeartFilled size={16} /> : <IconHeart size={16} />}
          onClick={async () => {
            setBusy("wishlist");
            try {
              await commerce.toggleWishlist({ courseId, courseTitle });
            } finally {
              setBusy("");
            }
          }}
        >
          {inWishlist ? "Saved to wishlist" : "Save to wishlist"}
        </Button>
        <Button
          radius="lg"
          variant={inCart ? "filled" : "light"}
          color="blue"
          loading={busy === "cart"}
          leftSection={
            inCart ? <IconShoppingCartFilled size={16} /> : <IconShoppingCart size={16} />
          }
          onClick={async () => {
            setBusy("cart");
            if (inCart) {
              router.push("/cart");
              setBusy("");
              return;
            }

            try {
              await commerce.addToCart({ courseId, courseTitle });
            } finally {
              setBusy("");
            }
          }}
        >
          {inCart ? "Open cart" : "Add to cart"}
        </Button>
      </Group>

      <Text size="sm" c="dimmed">
        Save courses for later or move straight into the student checkout flow.
      </Text>
    </Stack>
  );
}

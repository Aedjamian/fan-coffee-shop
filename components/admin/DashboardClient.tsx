"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type {
  CustomSection,
  MenuCategory,
  MenuItem,
  SiteContent,
} from "@/lib/content-types";
import { newId } from "@/lib/id";
import { defaultExtrasCategory } from "@/lib/menu-defaults";

type Props = {
  initialContent: SiteContent;
  username?: string;
};

function Field({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      {multiline ? (
        <textarea
          rows={4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}

export function DashboardClient({ initialContent, username }: Props) {
  const router = useRouter();
  const [content, setContent] = useState<SiteContent>({
    ...initialContent,
    customSections: initialContent.customSections ?? [],
  });
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  function patch<K extends keyof SiteContent>(
    section: K,
    value: SiteContent[K],
  ) {
    setContent((prev) => ({ ...prev, [section]: value }));
    setStatus("idle");
  }

  async function save() {
    setStatus("saving");
    setMessage("");
    try {
      const response = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      const data = (await response.json()) as {
        error?: string;
        storage?: string;
      };
      if (!response.ok) {
        setStatus("error");
        setMessage(data.error ?? "Save failed.");
        return;
      }
      setStatus("saved");
      const preview = `/?preview=${Date.now()}`;
      setMessage(
        data.storage === "blob"
          ? `Saved to Vercel Blob. Open the homepage (link above) or refresh — updates should appear right away.`
          : `Saved locally. Refresh the homepage to preview.`,
      );
      router.refresh();
    } catch {
      setStatus("error");
      setMessage("Could not save. Check your connection.");
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  function updateCategory(index: number, category: MenuCategory) {
    const next = [...content.menuCategories];
    next[index] = category;
    patch("menuCategories", next);
  }

  function addCategory() {
    const category: MenuCategory = {
      id: newId("category"),
      title: "New category",
      subtitle: "",
      items: [],
    };
    patch("menuCategories", [...content.menuCategories, category]);
  }

  function removeCategory(index: number) {
    patch(
      "menuCategories",
      content.menuCategories.filter((_, i) => i !== index),
    );
  }

  function addMenuItem(categoryIndex: number) {
    const category = content.menuCategories[categoryIndex];
    const item: MenuItem = {
      id: newId("item"),
      name: "New item",
      price: "$0.00",
    };
    updateCategory(categoryIndex, {
      ...category,
      items: [...category.items, item],
    });
  }

  function updateMenuItem(
    categoryIndex: number,
    itemIndex: number,
    item: MenuItem,
  ) {
    const category = content.menuCategories[categoryIndex];
    const items = [...category.items];
    items[itemIndex] = item;
    updateCategory(categoryIndex, { ...category, items });
  }

  function removeMenuItem(categoryIndex: number, itemIndex: number) {
    const category = content.menuCategories[categoryIndex];
    updateCategory(categoryIndex, {
      ...category,
      items: category.items.filter((_, i) => i !== itemIndex),
    });
  }

  function updateBullet(index: number, value: string) {
    const bullets = [...content.catering.bullets];
    bullets[index] = value;
    patch("catering", { ...content.catering, bullets });
  }

  function addBullet() {
    patch("catering", {
      ...content.catering,
      bullets: [...content.catering.bullets, "New bullet point"],
    });
  }

  function removeBullet(index: number) {
    patch("catering", {
      ...content.catering,
      bullets: content.catering.bullets.filter((_, i) => i !== index),
    });
  }

  function updateCustomSection(index: number, section: CustomSection) {
    const next = [...(content.customSections ?? [])];
    next[index] = section;
    patch("customSections", next);
  }

  function addCustomSection() {
    const section: CustomSection = {
      id: newId("section"),
      eyebrow: "",
      heading: "Section title",
      body: "Tell customers what’s new — a special, seasonal item, or announcement.",
    };
    patch("customSections", [...(content.customSections ?? []), section]);
  }

  function removeCustomSection(index: number) {
    patch(
      "customSections",
      (content.customSections ?? []).filter((_, i) => i !== index),
    );
  }

  function moveCustomSection(index: number, direction: -1 | 1) {
    const sections = [...(content.customSections ?? [])];
    const target = index + direction;
    if (target < 0 || target >= sections.length) {
      return;
    }
    [sections[index], sections[target]] = [sections[target], sections[index]];
    patch("customSections", sections);
  }

  const extrasCategoryIndex = content.menuCategories.findIndex(
    (c) => c.id === "extras",
  );
  const extrasCategory =
    extrasCategoryIndex >= 0
      ? content.menuCategories[extrasCategoryIndex]
      : null;

  function ensureExtrasCategory() {
    if (extrasCategoryIndex >= 0) {
      return;
    }
    const drinksIndex = content.menuCategories.findIndex((c) => c.id === "drinks");
    const next = [...content.menuCategories];
    if (drinksIndex === -1) {
      next.push({ ...defaultExtrasCategory, items: [...defaultExtrasCategory.items] });
    } else {
      next.splice(drinksIndex, 0, {
        ...defaultExtrasCategory,
        items: defaultExtrasCategory.items.map((item) => ({ ...item })),
      });
    }
    patch("menuCategories", next);
  }

  const menuCategoriesWithoutExtras = content.menuCategories.filter(
    (c) => c.id !== "extras",
  );

  return (
    <div className="admin-shell admin-dashboard">
      <header className="admin-topbar">
        <div>
          <h1>Site dashboard</h1>
          <p className="admin-muted">
            Signed in as {username ?? "admin"}. Edit copy and menu, then save.
          </p>
        </div>
        <div className="admin-topbar-actions">
          <Link href="/" className="btn btn-secondary admin-btn" target="_blank">
            View site
          </Link>
          <button type="button" className="btn btn-secondary admin-btn" onClick={logout}>
            Log out
          </button>
          <button
            type="button"
            className="btn btn-primary admin-btn"
            onClick={save}
            disabled={status === "saving"}
          >
            {status === "saving" ? "Saving…" : "Save changes"}
          </button>
        </div>
      </header>

      {message ? (
        <p className={status === "error" ? "admin-error admin-banner" : "admin-success admin-banner"}>
          {message}
        </p>
      ) : null}

      <div className="admin-sections">
        <section className="admin-panel">
          <h2>Brand &amp; hero</h2>
          <div className="admin-grid">
            <Field
              label="Brand name (bold)"
              value={content.brand.nameStrong}
              onChange={(v) => patch("brand", { ...content.brand, nameStrong: v })}
            />
            <Field
              label="Brand subtitle"
              value={content.brand.nameSub}
              onChange={(v) => patch("brand", { ...content.brand, nameSub: v })}
            />
            <Field
              label="Hero tag"
              value={content.hero.tag}
              onChange={(v) => patch("hero", { ...content.hero, tag: v })}
            />
            <Field
              label="Hero title (first part)"
              value={content.hero.titleBefore}
              onChange={(v) => patch("hero", { ...content.hero, titleBefore: v })}
            />
            <Field
              label="Hero title (emphasis)"
              value={content.hero.titleEmphasis}
              onChange={(v) =>
                patch("hero", { ...content.hero, titleEmphasis: v })
              }
            />
            <Field
              label="Primary button"
              value={content.hero.primaryCta}
              onChange={(v) => patch("hero", { ...content.hero, primaryCta: v })}
            />
            <Field
              label="Secondary button"
              value={content.hero.secondaryCta}
              onChange={(v) =>
                patch("hero", { ...content.hero, secondaryCta: v })
              }
            />
          </div>
          <Field
            label="Hero description"
            value={content.hero.description}
            onChange={(v) => patch("hero", { ...content.hero, description: v })}
            multiline
          />
        </section>

        <section className="admin-panel">
          <h2>Menu section intro</h2>
          <Field
            label="Heading"
            value={content.menuSection.heading}
            onChange={(v) =>
              patch("menuSection", { ...content.menuSection, heading: v })
            }
          />
          <Field
            label="Subtitle"
            value={content.menuSection.subtitle}
            onChange={(v) =>
              patch("menuSection", { ...content.menuSection, subtitle: v })
            }
            multiline
          />
        </section>

        <section className="admin-panel admin-panel-wide">
          <div className="admin-panel-head">
            <div>
              <h2>Extras</h2>
              <p className="admin-muted admin-panel-desc">
                Add-on prices (extra bacon, cheese, homefries, etc.) — shows on
                the menu with your other categories.
              </p>
            </div>
            {!extrasCategory ? (
              <button
                type="button"
                className="btn btn-secondary admin-btn"
                onClick={ensureExtrasCategory}
              >
                Add Extras to menu
              </button>
            ) : null}
          </div>

          {extrasCategory && extrasCategoryIndex >= 0 ? (
            <div className="admin-menu-category">
              <div className="admin-grid">
                <Field
                  label="Category title"
                  value={extrasCategory.title}
                  onChange={(v) =>
                    updateCategory(extrasCategoryIndex, {
                      ...extrasCategory,
                      title: v,
                    })
                  }
                />
                <Field
                  label="Subtitle"
                  value={extrasCategory.subtitle}
                  onChange={(v) =>
                    updateCategory(extrasCategoryIndex, {
                      ...extrasCategory,
                      subtitle: v,
                    })
                  }
                />
              </div>
              <div className="admin-items">
                {extrasCategory.items.map((item, itemIndex) => (
                  <div key={item.id} className="admin-item-row">
                    <Field
                      label="Extra name"
                      value={item.name}
                      onChange={(v) =>
                        updateMenuItem(extrasCategoryIndex, itemIndex, {
                          ...item,
                          name: v,
                        })
                      }
                    />
                    <Field
                      label="Price"
                      value={item.price}
                      onChange={(v) =>
                        updateMenuItem(extrasCategoryIndex, itemIndex, {
                          ...item,
                          price: v,
                        })
                      }
                    />
                    <Field
                      label="Note (optional)"
                      value={item.description ?? ""}
                      onChange={(v) =>
                        updateMenuItem(extrasCategoryIndex, itemIndex, {
                          ...item,
                          description: v || undefined,
                        })
                      }
                    />
                    <button
                      type="button"
                      className="admin-link-danger admin-item-remove"
                      onClick={() =>
                        removeMenuItem(extrasCategoryIndex, itemIndex)
                      }
                    >
                      Remove extra
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="btn btn-secondary admin-btn"
                onClick={() => addMenuItem(extrasCategoryIndex)}
              >
                Add extra
              </button>
            </div>
          ) : null}
        </section>

        <section className="admin-panel admin-panel-wide">
          <div className="admin-panel-head">
            <h2>Menu categories &amp; items</h2>
            <button type="button" className="btn btn-secondary admin-btn" onClick={addCategory}>
              Add category
            </button>
          </div>

          {menuCategoriesWithoutExtras.map((category, categoryIndex) => {
            const index = content.menuCategories.findIndex(
              (c) => c.id === category.id,
            );
            return (
            <div key={category.id} className="admin-menu-category">
              <div className="admin-menu-category-head">
                <h3>Category {categoryIndex + 1}</h3>
                <button
                  type="button"
                  className="admin-link-danger"
                  onClick={() => removeCategory(index)}
                >
                  Remove category
                </button>
              </div>
              <div className="admin-grid">
                <Field
                  label="Title"
                  value={category.title}
                  onChange={(v) =>
                    updateCategory(index, { ...category, title: v })
                  }
                />
                <Field
                  label="Subtitle"
                  value={category.subtitle}
                  onChange={(v) =>
                    updateCategory(index, { ...category, subtitle: v })
                  }
                />
              </div>
              <label className="admin-checkbox">
                <input
                  type="checkbox"
                  checked={Boolean(category.featured)}
                  onChange={(e) =>
                    updateCategory(index, {
                      ...category,
                      featured: e.target.checked,
                    })
                  }
                />
                Show signature badge
              </label>

              <div className="admin-items">
                {category.items.map((item, itemIndex) => (
                  <div key={item.id} className="admin-item-row">
                    <Field
                      label="Item name"
                      value={item.name}
                      onChange={(v) =>
                        updateMenuItem(index, itemIndex, {
                          ...item,
                          name: v,
                        })
                      }
                    />
                    <Field
                      label="Price"
                      value={item.price}
                      onChange={(v) =>
                        updateMenuItem(index, itemIndex, {
                          ...item,
                          price: v,
                        })
                      }
                    />
                    <Field
                      label="Description (optional)"
                      value={item.description ?? ""}
                      onChange={(v) =>
                        updateMenuItem(index, itemIndex, {
                          ...item,
                          description: v || undefined,
                        })
                      }
                    />
                    <button
                      type="button"
                      className="admin-link-danger admin-item-remove"
                      onClick={() => removeMenuItem(index, itemIndex)}
                    >
                      Remove item
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="btn btn-secondary admin-btn"
                onClick={() => addMenuItem(index)}
              >
                Add menu item
              </button>
            </div>
          );
          })}
        </section>

        <section className="admin-panel">
          <h2>About</h2>
          <Field
            label="Heading"
            value={content.about.heading}
            onChange={(v) => patch("about", { ...content.about, heading: v })}
          />
          <Field
            label="Body"
            value={content.about.body}
            onChange={(v) => patch("about", { ...content.about, body: v })}
            multiline
          />
        </section>

        <section className="admin-panel">
          <h2>Catering</h2>
          <div className="admin-grid">
            <Field
              label="Small label above title"
              value={content.catering.eyebrow}
              onChange={(v) =>
                patch("catering", { ...content.catering, eyebrow: v })
              }
            />
            <Field
              label="Heading"
              value={content.catering.heading}
              onChange={(v) =>
                patch("catering", { ...content.catering, heading: v })
              }
            />
            <Field
              label="Call-to-action label"
              value={content.catering.ctaLabel}
              onChange={(v) =>
                patch("catering", { ...content.catering, ctaLabel: v })
              }
            />
          </div>
          <Field
            label="Main text"
            value={content.catering.body}
            onChange={(v) => patch("catering", { ...content.catering, body: v })}
            multiline
          />
          <Field
            label="Note"
            value={content.catering.note}
            onChange={(v) => patch("catering", { ...content.catering, note: v })}
            multiline
          />
          <div className="admin-bullets">
            <p className="admin-field-label">Bullet points</p>
            {content.catering.bullets.map((bullet, index) => (
              <div key={`bullet-${index}`} className="admin-bullet-row">
                <input
                  type="text"
                  value={bullet}
                  onChange={(e) => updateBullet(index, e.target.value)}
                />
                <button
                  type="button"
                  className="admin-link-danger"
                  onClick={() => removeBullet(index)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button type="button" className="btn btn-secondary admin-btn" onClick={addBullet}>
              Add bullet
            </button>
          </div>
        </section>

        <section className="admin-panel admin-panel-wide">
          <div className="admin-panel-head">
            <div>
              <h2>Extra sections</h2>
              <p className="admin-muted admin-panel-desc">
                Add another block on the homepage — daily specials, holiday
                hours, catering reminders, or anything else customers should
                know.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-secondary admin-btn"
              onClick={addCustomSection}
            >
              Add section
            </button>
          </div>

          {(content.customSections ?? []).length === 0 ? (
            <p className="admin-muted">No extra sections yet — click Add section to create one.</p>
          ) : null}

          {(content.customSections ?? []).map((section, index) => (
            <div key={section.id} className="admin-menu-category">
              <div className="admin-menu-category-head">
                <h3>Section {index + 1}</h3>
                <div className="admin-section-actions">
                  <button
                    type="button"
                    className="admin-link-muted"
                    disabled={index === 0}
                    onClick={() => moveCustomSection(index, -1)}
                  >
                    Move up
                  </button>
                  <button
                    type="button"
                    className="admin-link-muted"
                    disabled={index === (content.customSections?.length ?? 0) - 1}
                    onClick={() => moveCustomSection(index, 1)}
                  >
                    Move down
                  </button>
                  <button
                    type="button"
                    className="admin-link-danger"
                    onClick={() => removeCustomSection(index)}
                  >
                    Remove section
                  </button>
                </div>
              </div>
              <div className="admin-grid">
                <Field
                  label="Link name (for # links on the page, e.g. specials)"
                  value={section.anchor ?? ""}
                  onChange={(v) =>
                    updateCustomSection(index, {
                      ...section,
                      anchor: v || undefined,
                    })
                  }
                />
                <Field
                  label='Small line above title (optional, e.g. "Today only")'
                  value={section.eyebrow ?? ""}
                  onChange={(v) =>
                    updateCustomSection(index, {
                      ...section,
                      eyebrow: v || undefined,
                    })
                  }
                />
                <Field
                  label="Title"
                  value={section.heading}
                  onChange={(v) =>
                    updateCustomSection(index, { ...section, heading: v })
                  }
                />
              </div>
              <Field
                label="Description"
                value={section.body}
                onChange={(v) =>
                  updateCustomSection(index, { ...section, body: v })
                }
                multiline
              />
              <div className="admin-grid">
                <Field
                  label="Button text (optional, e.g. View menu)"
                  value={section.linkLabel ?? ""}
                  onChange={(v) =>
                    updateCustomSection(index, {
                      ...section,
                      linkLabel: v || undefined,
                    })
                  }
                />
                <Field
                  label="Button goes to (optional, e.g. #menu or tel:+15165361444)"
                  value={section.linkHref ?? ""}
                  onChange={(v) =>
                    updateCustomSection(index, {
                      ...section,
                      linkHref: v || undefined,
                    })
                  }
                />
              </div>
            </div>
          ))}
        </section>

        <section className="admin-panel">
          <h2>Visit &amp; contact</h2>
          <Field
            label="Section heading"
            value={content.visit.heading}
            onChange={(v) => patch("visit", { ...content.visit, heading: v })}
          />
          <Field
            label="Section subtitle"
            value={content.visit.subtitle}
            onChange={(v) => patch("visit", { ...content.visit, subtitle: v })}
            multiline
          />
          <Field
            label="Hours (one line per row)"
            value={content.visit.hours}
            onChange={(v) => patch("visit", { ...content.visit, hours: v })}
            multiline
          />
          <div className="admin-grid">
            <Field
              label="Address line 1"
              value={content.visit.addressLine1}
              onChange={(v) =>
                patch("visit", { ...content.visit, addressLine1: v })
              }
            />
            <Field
              label="Address line 2"
              value={content.visit.addressLine2}
              onChange={(v) =>
                patch("visit", { ...content.visit, addressLine2: v })
              }
            />
            <Field
              label="Phone (display)"
              value={content.visit.phone}
              onChange={(v) => patch("visit", { ...content.visit, phone: v })}
            />
            <Field
              label="Phone (tel link, e.g. +15165361444)"
              value={content.visit.phoneTel}
              onChange={(v) => patch("visit", { ...content.visit, phoneTel: v })}
            />
            <Field
              label="Google Maps query"
              value={content.visit.mapsQuery}
              onChange={(v) =>
                patch("visit", { ...content.visit, mapsQuery: v })
              }
            />
          </div>
        </section>

        <section className="admin-panel">
          <h2>Footer</h2>
          <Field
            label="Footer text"
            value={content.footer.text}
            onChange={(v) => patch("footer", { text: v })}
            multiline
          />
        </section>
      </div>

      <footer className="admin-sticky-save">
        <button
          type="button"
          className="btn btn-primary admin-btn"
          onClick={save}
          disabled={status === "saving"}
        >
          {status === "saving" ? "Saving…" : "Save all changes"}
        </button>
      </footer>
    </div>
  );
}

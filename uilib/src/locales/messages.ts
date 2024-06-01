export const messages = {
  pages: {
    register: {
      form: {
        title: "page.register.form.title",
        name: {
          label: "page.register.form.name.label",
          placeholder: "page.register.form.name.placeholder",
        },
        email: {
          label: "page.register.form.email.label",
          placeholder: "page.register.form.email.placeholder",
        },
        password: {
          label: "page.register.form.password.label",
          placeholder: "page.register.form.password.placeholder",
        },
        button: {
          label: "page.register.form.button.label",
        },
      },
    },
  },
  errors: {
    invalid: "errors.invalid",
    required: "errors.required",
    name: {
      length: {
        short: "errors.name.length.short",
        long: "errors.name.length.long",
      },
    },
    email: { invalid: "errors.email.invlaid" },
    password: { invalid: "errors.password.invlaid" },
  },
} as const;

<script setup lang="ts">
import Header from '@editorjs/header';
import List from '@editorjs/list';
import CodeTool from '@editorjs/code';
import Paragraph from '@editorjs/paragraph';
import Embed from '@editorjs/embed';
import Table from '@editorjs/table';
import Checklist from '@editorjs/checklist';
import Marker from '@editorjs/marker';
import Warning from '@editorjs/warning';
import RawTool from '@editorjs/raw';
import Quote from '@editorjs/quote';
import InlineCode from '@editorjs/inline-code';
import Delimiter from '@editorjs/delimiter';
import SimpleImage from '@editorjs/simple-image';
import DragDrop from 'editorjs-drag-drop';
import edjsHTML from 'editorjs-html';
import html2pdf from 'html2pdf.js';

import { ref, computed, watchEffect, watch, onMounted } from 'vue';
const value = ref();
const emit = defineEmits(['update:modelValue']);
interface Props {
  modelValue: string;
  fields: any; // type of new Map<string,string>()
}

const props = defineProps<Props>();
const data = {
  time: 1591362820041,
  blocks: [
    {
      type: 'header',
      data: {
        text: 'Sample Membership Card',
        level: 2,
      },
    },
    {
      type: 'fields',
      data: {
        field: 'full_name',
      },
    },
    {
      type: 'fields',
      data: {
        field: 'email',
      },
    },
    {
      type: 'fields',
      data: {
        field: 'company',
      },
    },
  ],
  version: '2.18.0',
};
const editorCore = ref();
const onInitialized = (instance) => {
  editorCore.value = instance;
};
const onReady = async () => {
  const editor = editorCore.value;
  new DragDrop(editor);
  value.value = await editor.save();
};
const onChange = async (args) => {
  value.value = await args.saver.save();
};

// tool to import fields
class Fields {
  constructor({ data, api, config, readOnly, block }) {
    // this.api.toolbar.open();
    this.data = {
      field: data.field || '',
    };
    this.wrapper = undefined;
  }
  render() {
    this.wrapper = document.createElement('div');
    const input = document.createElement('div');
    this.wrapper.appendChild(input);
    this.wrapper.classList.add('cdx-input');
    const name = this.data && this.data.field ? this.data.field : '';
    input.dataset.field = name;
    input.style.whiteSpace = 'pre-wrap';
    input.contentEditable = true;
    input.innerHTML = ` <span contenteditable="false">{{ ${name} }}</span> `;
    return this.wrapper;
  }
  save(blockContent) {
    const input = blockContent.querySelector('[data-field]');
    const field = input.dataset.field;
    const text = `<p>${input.innerHTML.trim()}</p>`;
    return {
      field,
      text,
    };
  }
  validate(savedData) {
    if (!savedData.field.trim()) {
      return false;
    }
    return true;
  }

  static get toolbox() {
    const icon = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="System / Code"> <path id="Vector" d="M15 7L20 12L15 17M9 17L4 12L9 7" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g> </g></svg>`;
    return [...props.fields].map(([field, title]) => ({
      icon,
      title,
      data: {
        field,
      },
    }));
  }
}

const tools = {
  paragraph: Paragraph,
  header: Header,
  fields: {
    class: Fields,
  },
};
const config = {
  tools,
  data,
  onReady,
  onChange,
};

// convert editjs json to html:
const fieldsParser = (block) => {
  return block.data.text.replace(
    /\<span contenteditable=\"false\"\>(\{\{[\w ]*\}\})\<\/span\>/,
    '$1'
  );
};
const edjsParser = edjsHTML({ fields: fieldsParser });
const html = computed(() => {
  if (value.value) {
    const HTML = edjsParser.parseStrict(value.value);
    if (HTML instanceof Error) {
      console.error(Error);
      return '';
    }
    return HTML.join('\n');
  } else {
    return '';
  }
});
watch(
  () => html.value,
  (newValue) => {
    makeImage();
  }
);

watchEffect(() => {
  emit('update:modelValue', html.value);
});

const image = ref();
const datauri = ref();
const makePDF = async () => {
  if (!member.value) return;
  var element = document.getElementById('element-to-print');
  const output = await html2pdf().from(element).outputPdf('datauri');
  console.log('aaaaa', ouput.slice(0, 100));
  datauri.value = output;
};
const makeImage = async () => {
  var element = document.getElementById('element-to-print');
  const output = await html2pdf().from(element).outputImg();
  image.value = output.src;
};

onMounted(() => makeImage());

const member = ref(0);
watch(
  () => member.value,
  (newValue) => {
    makeImage();
  }
);

const members = [
  {
    id: 1,
    email: 'd.jones@email.com',
    full_name: 'Dave Jones',
    job_title: 'Developer',
    company: 'Microsoft',
  },
  {
    id: 2,
    email: 'd.parry2123@email.com',
    full_name: 'Lynda Parry',
    job_title: 'CTO',
    company: 'Twitter',
  },
];
const selected_member = computed(() => {
  return members.find((i) => i.id === member.value);
});

// return a string with the placeholders swapped for data
const swap_placeholders = (str, data) => {
  if (!data) return str;
  const regex = /(\{\{[\w ]*\}\})/g;
  const found = str.match(regex);
  let newString = str;
  found.forEach(
    (i) =>
      (newString = newString.replace(i, (match) => {
        const field = match.replaceAll(/\W/g, '');
        return data[field];
      }))
  );
  return newString;
};

const page = ref('editor');
</script>

<template>
  <div class="tabs is-large is-centered">
    <ul>
      <li :class="{ 'is-active': page === 'editor' }">
        <a @click="page = 'editor'">Editor</a>
      </li>
      <li :class="{ 'is-active': page === 'preview' }">
        <a @click="page = 'preview'">Preview</a>
      </li>
    </ul>
  </div>
  <section v-if="page === 'editor'" class="section">
    <div class="container is-max-desktop">
      <div class="columns">
        <div class="column">
          <h3 class="subtitle">Template Editor</h3>

          <div class="card id-card">
            <div class="card-content content">
              <editor :config="config" :initialized="onInitialized"></editor>
            </div>
          </div>

          <p class="help has-text-centered">Layout Editor</p>
        </div>
        <div class="column is-4 content is-align-self-center">
          <a
            class="content box id-card pt-6 px-5 mb-2"
            style="font-size: 0.5rem"
            v-html="swap_placeholders(html, selected_member)"
            @click="page = 'preview'"
          ></a>
          <p class="help has-text-centered">HTML small</p>
        </div>
      </div>
    </div>
  </section>

  <section v-if="page === 'preview'" class="section">
    <div class="container is-max-desktop">
      <div class="columns">
        <div class="column">
          <h3 class="subtitle">Output</h3>
        </div>
        <div class="column is-narrow">
          <div class="field">
            <div class="control">
              <div class="select">
                <select id="id_member" v-model="member">
                  <option value="0">Select a Member</option>
                  <option
                    :id="member.id"
                    v-for="member in members"
                    :key="member.id"
                    :value="member.id"
                  >
                    {{ member.full_name }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="columns">
        <div class="column is-4">
          <a class="image" v-if="image" @click="page = 'editor'">
            <img :src="image" />
          </a>
          <p class="help has-text-centered">Image</p>
        </div>
        <div class="column">
          <a
            class="content box id-card pt-6 px-5 mb-2 has-background-white"
            v-html="swap_placeholders(html, selected_member)"
            id="element-to-print"
            @click="page = 'editor'"
          ></a>
          <p class="help has-text-centered">HTML large</p>
        </div>
      </div>

      <blockquote class="notification" v-if="member == 0">
        Select a member to preview the template with the sample data
      </blockquote>

      <div class="block">
        <div class="buttons is-centered">
          <button @click="makePDF" class="button is-primary">
            Download as PDF
          </button>
          <button @click="makeImage" class="button is-primary">Refresh</button>
        </div>

        <template>
          <details open>
            <summary>Member Data:</summary>
            <pre v-if="member > 0">{{ selected_member }}</pre>
          </details>
        </template>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container is-max-desktop">
      <div class="block">
        <pre>
@tasks (2023-10-13):
  - load data into editor field
  - load pre-defined template
  - recalled saved data
  - parse template in database and pick out placeholders
  - provide configurable list of database fields
  - provide list of content editable blocks
  - allow user to select content block type
  - enable drag and drop to re-order blocks
  - merge users data with template placeholders
  - produce clean html from merge
  - produce image output from merge
  - produce pdf output from merge

@todo:
  - integrate images
  - replace pdf generation with backend code
  - replace template data with backend renderer
  - improve ui of content blocks
  - get better list of fields
  - get better sample data
  - integrate layout field with django
  - produce batch printing system

</pre
        >
      </div>
      <div class="block">
        <details>
          <summary>HTML</summary>
          <pre>{{ html }}</pre>
        </details>
        <details>
          <summary>EditJS data</summary>
          <pre>{{ value }}</pre>
        </details>
      </div>
    </div>
  </section>
</template>

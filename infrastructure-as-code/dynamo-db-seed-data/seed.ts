interface Player {
  pk: { S: string };
  sk: { S: string };
  firstName: { S: string };
  lastName: { S: string };
  position: { S: string };
  created: { S: string };
  modified: { S: string };
}

const primaryKey = "core";
const date = new Date().toISOString();

export const dataInit: { PutRequest: { Item: Player } }[] = [
  {
    PutRequest: {
      Item: {
        pk: { S: primaryKey },
        sk: { S: "1ce70527-4e60-4f8d-a2b7-eefcf776bb2a" },
        firstName: { S: "Patrick" },
        lastName: { S: "St-Arnaud" },
        position: { S: "D" },
        created: { S: date },
        modified: { S: date },
      },
    },
  },
  {
    PutRequest: {
      Item: {
        pk: { S: primaryKey },
        sk: { S: "91919cd7-0827-457a-a648-29dfc4734f92" },
        firstName: { S: "Nick" },
        lastName: { S: "Soucy" },
        position: { S: "F" },
        created: { S: date },
        modified: { S: date },
      },
    },
  },
  {
    PutRequest: {
      Item: {
        pk: { S: primaryKey },
        sk: { S: "51205729-39d3-40ba-808a-4792cc71a47b" },
        firstName: { S: "Anthony" },
        lastName: { S: "Hurteau" },
        position: { S: "D" },
        created: { S: date },
        modified: { S: date },
      },
    },
  },
  {
    PutRequest: {
      Item: {
        pk: { S: primaryKey },
        sk: { S: "000e5573-97b9-4acd-a209-ef32991d501e" },
        firstName: { S: "Maxime" },
        lastName: { S: "Dolan-Théoret" },
        position: { S: "G" },
        created: { S: date },
        modified: { S: date },
      },
    },
  },
  {
    PutRequest: {
      Item: {
        pk: { S: primaryKey },
        sk: { S: "fceda60a-c298-4f37-b7a7-15e07521817f" },
        firstName: { S: "Mathieu" },
        lastName: { S: "Desrochers" },
        position: { S: "F" },
        created: { S: date },
        modified: { S: date },
      },
    },
  },
  {
    PutRequest: {
      Item: {
        pk: { S: primaryKey },
        sk: { S: "4847a27e-9208-459d-9cc3-2498097efee0" },
        firstName: { S: "Nicola" },
        lastName: { S: "Brunone" },
        position: { S: "F" },
        created: { S: date },
        modified: { S: date },
      },
    },
  },
  {
    PutRequest: {
      Item: {
        pk: { S: primaryKey },
        sk: { S: "964c2956-5ddd-4f46-a59b-b3547b5db0c5" },
        firstName: { S: "David" },
        lastName: { S: "Leroux" },
        position: { S: "F" },
        created: { S: date },
        modified: { S: date },
      },
    },
  },
  {
    PutRequest: {
      Item: {
        pk: { S: primaryKey },
        sk: { S: "b3ca39f0-787a-4b5f-b032-643a1f5b8fd1" },
        firstName: { S: "Sébastien" },
        lastName: { S: "Podtetenev" },
        position: { S: "F" },
        created: { S: date },
        modified: { S: date },
      },
    },
  },
  {
    PutRequest: {
      Item: {
        pk: { S: primaryKey },
        sk: { S: "971759ae-f792-4c70-9bde-dbfd13337a31" },
        firstName: { S: "Carl" },
        lastName: { S: "Blais" },
        position: { S: "D" },
        created: { S: date },
        modified: { S: date },
      },
    },
  },
  {
    PutRequest: {
      Item: {
        pk: { S: primaryKey },
        sk: { S: "076f2115-bda5-4d2e-af35-24e8f0a181e4" },
        firstName: { S: "Maxime" },
        lastName: { S: "Alie-Messier" },
        position: { S: "D" },
        created: { S: date },
        modified: { S: date },
      },
    },
  },
  {
    PutRequest: {
      Item: {
        pk: { S: primaryKey },
        sk: { S: "e9158a37-541a-4d13-a8d8-a29818773348" },
        firstName: { S: "Jonathan" },
        lastName: { S: "Brodeur" },
        position: { S: "F" },
        created: { S: date },
        modified: { S: date },
      },
    },
  },
  {
    PutRequest: {
      Item: {
        pk: { S: primaryKey },
        sk: { S: "eba1d64c-d0e1-425e-89ea-99b7a31a4a2f" },
        firstName: { S: "Alexandre" },
        lastName: { S: "Côté" },
        position: { S: "F" },
        created: { S: date },
        modified: { S: date },
      },
    },
  },
];

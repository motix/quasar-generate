interface Channel {
  id: string;
  name: string;
}

interface Message {
  text: string;
  ts: string;
  user: string;
}

interface User {
  id: string;
  profile: {
    email?: string;
    image_192: string;
  };
  real_name: string;
}

declare namespace Conversations.Create {
  export interface Response {
    channel: Channel;
  }
}

declare namespace Conversations.History {
  export interface Response {
    messages: Message[];
  }
}

declare namespace Conversations.List {
  export interface Response {
    channels: Channel[];
  }
}

declare namespace Conversations.Members {
  export interface Response {
    members: string[];
  }
}

declare namespace Users.Conversations {
  export interface Response {
    channels: Channel[];
  }
}

declare namespace Users.Info {
  export interface Response {
    user: User;
  }
}

declare namespace Users.List {
  export interface Response {
    members: User[];
  }
}

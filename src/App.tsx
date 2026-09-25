import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { createClient } from "@supabase/supabase-js";
import "./App.css";

/* =========================================================
   SUPABASE
========================================================= */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY"
  );
}

const supabase = createClient(
  supabaseUrl || "",
  supabaseAnonKey || ""
);

/* =========================================================
   TYPES
========================================================= */

type Song = {
  id: number;
  title: string;
  artist: string;
  language: string;
  cover: string;
  audio: string;
  isLocal?: boolean;
};

type Playlist = {
  id: number;
  name: string;
  songIds: number[];
};

/* =========================================================
   INITIAL SONGS
========================================================= */

const initialSongs: Song[] = [
  {
    id: 1,
    title: "Song One",
    artist: "Artist One",
    language: "Telugu",
    cover: "/music/cover1.jpg",
    audio: "/music/song1.mp3",
  },
  {
    id: 2,
    title: "Song Two",
    artist: "Artist Two",
    language: "Hindi",
    cover: "/music/cover2.jpg",
    audio: "/music/song2.mp3",
  },
  {
    id: 3,
    title: "Song Three",
    artist: "Artist Three",
    language: "English",
    cover: "/music/cover3.jpg",
    audio: "/music/song3.mp3",
  },
  {
    id: 4,
    title: "Song Four",
    artist: "Artist Four",
    language: "Tamil",
    cover: "/music/cover4.jpg",
    audio: "/music/song4.mp3",
  },
  {
    id: 5,
    title: "Song Five",
    artist: "Artist Five",
    language: "Kannada",
    cover: "/music/cover5.jpg",
    audio: "/music/song5.mp3",
  },
  {
    id: 6,
    title: "Song Six",
    artist: "Artist Six",
    language: "Malayalam",
    cover: "/music/cover6.jpg",
    audio: "/music/song6.mp3",
  },
];

const languages = [
  "All",
  "Telugu",
  "Hindi",
  "English",
  "Tamil",
  "Kannada",
  "Malayalam",
];

/* =========================================================
   HELPERS
========================================================= */

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/* =========================================================
   SONG CARD
========================================================= */

type SongCardProps = {
  song: Song;
  onPlay: () => void;
  isPlaying: boolean;
  isFavorite: boolean;
  onFavorite: () => void;
  onAddToQueue: () => void;
  onPlayNext: () => void;
};

function SongCard({
  song,
  onPlay,
  isPlaying,
  isFavorite,
  onFavorite,
  onAddToQueue,
  onPlayNext,
}: SongCardProps) {
  return (
    <div className="song-card">
      <div className="song-cover-wrapper">
        <img
          className="song-cover"
          src={song.cover}
          alt={song.title}
          onError={(e) => {
            e.currentTarget.src = "/music/default-cover.jpg";
          }}
        />

        <button className="cover-play" onClick={onPlay}>
          {isPlaying ? "❚❚" : "▶"}
        </button>
      </div>

      <div className="song-info">
        <h3>{song.title}</h3>
        <p>{song.artist}</p>
        <span>{song.language}</span>
      </div>

      <div className="song-actions">
        <button
          className={`small-action ${
            isFavorite ? "favorite-active" : ""
          }`}
          onClick={onFavorite}
          title="Favorite"
        >
          {isFavorite ? "♥" : "♡"}
        </button>

        <button
          className="small-action"
          onClick={onAddToQueue}
          title="Add to Queue"
        >
          +
        </button>

        <button
          className="small-action"
          onClick={onPlayNext}
          title="Play Next"
        >
          ⏭
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   APP
========================================================= */

function App() {
  const [allSongs, setAllSongs] =
    useState<Song[]>(initialSongs);

  const [currentSong, setCurrentSong] =
    useState<Song | null>(initialSongs[0]);

  const [isPlaying, setIsPlaying] = useState(false);

  const [favorites, setFavorites] =
    useState<number[]>([]);

  const [search, setSearch] = useState("");

  const [selectedLanguage, setSelectedLanguage] =
    useState("All");

  const [activePage, setActivePage] =
    useState("Home");

  const [loadingSongs, setLoadingSongs] =
    useState(true);

  const [creatorLoggedIn, setCreatorLoggedIn] =
    useState(false);

  const [creatorPin, setCreatorPin] =
    useState("");

  const [loginError, setLoginError] =
    useState("");

  const [newSongTitle, setNewSongTitle] =
    useState("");

  const [newArtist, setNewArtist] =
    useState("");

  const [newLanguage, setNewLanguage] =
    useState("Telugu");

  const [audioFile, setAudioFile] =
    useState<File | null>(null);

  const [coverFile, setCoverFile] =
    useState<File | null>(null);

  const [editingSongId, setEditingSongId] =
    useState<number | null>(null);

  const [editTitle, setEditTitle] =
    useState("");

  const [editArtist, setEditArtist] =
    useState("");

  const [editLanguage, setEditLanguage] =
    useState("");

  const [currentTime, setCurrentTime] =
    useState(0);

  const [duration, setDuration] =
    useState(0);

  const [volume, setVolume] =
    useState(1);

  const [isMuted, setIsMuted] =
    useState(false);

  const [queue, setQueue] =
    useState<number[]>([]);

  const [isQueueMode, setIsQueueMode] =
    useState(false);

  const [playlists, setPlaylists] =
    useState<Playlist[]>([]);

  const [selectedPlaylistId, setSelectedPlaylistId] =
    useState<number | null>(null);

  const [newPlaylistName, setNewPlaylistName] =
    useState("");

  const [editingPlaylistId, setEditingPlaylistId] =
    useState<number | null>(null);

  const [editingPlaylistName, setEditingPlaylistName] =
    useState("");

  const [, setLogoTapCount] =
    useState(0);

  const audioRef =
    useRef<HTMLAudioElement | null>(null);

  /* =========================================================
     LOGO ACCESS
  ========================================================= */

  const handleLogoClick = () => {
    if (creatorLoggedIn) {
      setActivePage("Home");
      return;
    }

    setLogoTapCount((oldCount) => {
      const newCount = oldCount + 1;

      if (newCount >= 5) {
        setLogoTapCount(0);
        setActivePage("Creator");
        return 0;
      }

      return newCount;
    });
  };

  /* =========================================================
     LOAD SONGS FROM SUPABASE
  ========================================================= */

  useEffect(() => {
    const loadSongs = async () => {
      try {
        const { data, error } = await supabase
          .from("songs")
          .select(
            "id,title,artist,language,audio_url,cover_url"
          )
          .order("created_at", {
            ascending: true,
          });

        if (error) {
          console.error(
            "Could not load Supabase songs:",
            error
          );
          return;
        }

        const remoteSongs: Song[] = (data || []).map(
          (song) => ({
            id: Number(song.id),
            title: song.title,
            artist: song.artist,
            language: song.language,
            audio: song.audio_url,
            cover: song.cover_url,
            isLocal: true,
          })
        );

        setAllSongs([
          ...initialSongs,
          ...remoteSongs,
        ]);
      } catch (error) {
        console.error(
          "Could not load songs:",
          error
        );
      } finally {
        setLoadingSongs(false);
      }
    };

    loadSongs();
  }, []);

  /* =========================================================
     LOAD LOCAL USER DATA
  ========================================================= */

  useEffect(() => {
    try {
      const savedFavorites =
        localStorage.getItem(
          "swaram-favorites"
        );

      if (savedFavorites) {
        const parsed = JSON.parse(
          savedFavorites
        );

        if (Array.isArray(parsed)) {
          setFavorites(parsed);
        }
      }

      const savedQueue =
        localStorage.getItem("swaram-queue");

      if (savedQueue) {
        const parsedQueue =
          JSON.parse(savedQueue);

        if (Array.isArray(parsedQueue)) {
          setQueue(parsedQueue);
        }
      }

      const savedPlaylists =
        localStorage.getItem(
          "swaram-playlists"
        );

      if (savedPlaylists) {
        const parsedPlaylists =
          JSON.parse(savedPlaylists);

        if (Array.isArray(parsedPlaylists)) {
          setPlaylists(parsedPlaylists);
        }
      }
    } catch (error) {
      console.error(
        "Could not load local data:",
        error
      );
    }
  }, []);

  /* =========================================================
     SAVE LOCAL DATA
  ========================================================= */

  useEffect(() => {
    localStorage.setItem(
      "swaram-favorites",
      JSON.stringify(favorites)
    );
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(
      "swaram-queue",
      JSON.stringify(queue)
    );
  }, [queue]);

  useEffect(() => {
    localStorage.setItem(
      "swaram-playlists",
      JSON.stringify(playlists)
    );
  }, [playlists]);

  /* =========================================================
     CLEAN QUEUE
  ========================================================= */

  useEffect(() => {
    if (!loadingSongs) {
      setQueue((oldQueue) =>
        oldQueue.filter((id) =>
          allSongs.some(
            (song) => song.id === id
          )
        )
      );
    }
  }, [loadingSongs, allSongs]);

  /* =========================================================
     VOLUME
  ========================================================= */

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume =
        isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  /* =========================================================
     CURRENT SONG
  ========================================================= */

  useEffect(() => {
    if (
      !currentSong ||
      !audioRef.current
    ) {
      return;
    }

    const audio = audioRef.current;

    audio.src = currentSong.audio;
    audio.load();

    setCurrentTime(0);

    if (isPlaying) {
      audio
        .play()
        .catch(() => {
          setIsPlaying(false);
        });
    }
  }, [currentSong]);

  /* =========================================================
     PLAYER
  ========================================================= */

  const playSong = (song: Song) => {
    setIsQueueMode(false);
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const playQueueSong = (songId: number) => {
    const song = allSongs.find(
      (item) => item.id === songId
    );

    if (!song) {
      return;
    }

    setIsQueueMode(true);
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (
      !audioRef.current ||
      !currentSong
    ) {
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const playNext = () => {
    if (allSongs.length === 0) {
      return;
    }

    if (
      isQueueMode &&
      currentSong
    ) {
      const queueIndex =
        queue.indexOf(currentSong.id);

      if (
        queueIndex !== -1 &&
        queueIndex < queue.length - 1
      ) {
        playQueueSong(
          queue[queueIndex + 1]
        );
        return;
      }

      setIsQueueMode(false);
    }

    const currentIndex =
      currentSong
        ? allSongs.findIndex(
            (song) =>
              song.id === currentSong.id
          )
        : -1;

    const nextIndex =
      currentIndex === -1
        ? 0
        : (currentIndex + 1) %
          allSongs.length;

    playSong(allSongs[nextIndex]);
  };

  const playPrevious = () => {
    if (allSongs.length === 0) {
      return;
    }

    if (
      isQueueMode &&
      currentSong
    ) {
      const queueIndex =
        queue.indexOf(currentSong.id);

      if (queueIndex > 0) {
        playQueueSong(
          queue[queueIndex - 1]
        );
        return;
      }
    }

    const currentIndex =
      currentSong
        ? allSongs.findIndex(
            (song) =>
              song.id === currentSong.id
          )
        : 0;

    const previousIndex =
      currentIndex <= 0
        ? allSongs.length - 1
        : currentIndex - 1;

    setIsQueueMode(false);
    playSong(
      allSongs[previousIndex]
    );
  };

  const handleSongEnded = () => {
    if (
      isQueueMode &&
      currentSong
    ) {
      const queueIndex =
        queue.indexOf(currentSong.id);

      if (
        queueIndex !== -1 &&
        queueIndex < queue.length - 1
      ) {
        playQueueSong(
          queue[queueIndex + 1]
        );
        return;
      }

      setIsQueueMode(false);
    }

    playNext();
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(
        audioRef.current.currentTime
      );
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(
        audioRef.current.duration || 0
      );
    }
  };

  const handleSeek = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const value = Number(
      e.target.value
    );

    if (audioRef.current) {
      audioRef.current.currentTime =
        value;

      setCurrentTime(value);
    }
  };

  const handleVolumeChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const value = Number(
      e.target.value
    );

    setVolume(value);

    if (value > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted((old) => !old);
  };

  /* =========================================================
     FAVORITES
  ========================================================= */

  const toggleFavorite = (id: number) => {
    setFavorites((old) => {
      if (old.includes(id)) {
        return old.filter(
          (item) => item !== id
        );
      }

      return [...old, id];
    });
  };

  /* =========================================================
     QUEUE
  ========================================================= */

  const addToQueue = (id: number) => {
    setQueue((oldQueue) => {
      if (oldQueue.includes(id)) {
        return oldQueue;
      }

      return [...oldQueue, id];
    });
  };

  const playNextInQueue = (id: number) => {
    setQueue((oldQueue) => {
      const cleanedQueue =
        oldQueue.filter(
          (item) => item !== id
        );

      if (
        isQueueMode &&
        currentSong &&
        cleanedQueue.includes(
          currentSong.id
        )
      ) {
        const currentIndex =
          cleanedQueue.indexOf(
            currentSong.id
          );

        cleanedQueue.splice(
          currentIndex + 1,
          0,
          id
        );

        return cleanedQueue;
      }

      cleanedQueue.unshift(id);

      return cleanedQueue;
    });
  };

  const playQueueNow = () => {
    if (queue.length === 0) {
      return;
    }

    playQueueSong(queue[0]);
  };

  const clearQueue = () => {
    setQueue([]);
    setIsQueueMode(false);
  };

  const removeFromQueue = (
    id: number
  ) => {
    const wasCurrent =
      currentSong?.id === id &&
      isQueueMode;

    const index =
      queue.indexOf(id);

    const nextId =
      index >= 0
        ? queue[index + 1] ??
          queue[index - 1]
        : undefined;

    setQueue((oldQueue) =>
      oldQueue.filter(
        (item) => item !== id
      )
    );

    if (wasCurrent) {
      if (nextId !== undefined) {
        setTimeout(() => {
          playQueueSong(nextId);
        }, 0);
      } else {
        setIsQueueMode(false);
      }
    }
  };

  const moveQueueItem = (
    index: number,
    direction: "up" | "down"
  ) => {
    setQueue((oldQueue) => {
      const newQueue = [
        ...oldQueue,
      ];

      const targetIndex =
        direction === "up"
          ? index - 1
          : index + 1;

      if (
        targetIndex < 0 ||
        targetIndex >=
          newQueue.length
      ) {
        return newQueue;
      }

      [
        newQueue[index],
        newQueue[targetIndex],
      ] = [
        newQueue[targetIndex],
        newQueue[index],
      ];

      return newQueue;
    });
  };

  /* =========================================================
     PLAYLISTS
  ========================================================= */

  const createPlaylist = () => {
    const name =
      newPlaylistName.trim();

    if (!name) {
      return;
    }

    const newPlaylist: Playlist = {
      id: Date.now(),
      name,
      songIds: [],
    };

    setPlaylists((old) => [
      ...old,
      newPlaylist,
    ]);

    setNewPlaylistName("");

    setSelectedPlaylistId(
      newPlaylist.id
    );
  };

  const deletePlaylist = (
    id: number
  ) => {
    if (
      !window.confirm(
        "Delete this playlist?"
      )
    ) {
      return;
    }

    setPlaylists((old) =>
      old.filter(
        (playlist) =>
          playlist.id !== id
      )
    );

    if (
      selectedPlaylistId === id
    ) {
      setSelectedPlaylistId(null);
    }
  };

  const savePlaylistRename = () => {
    if (
      editingPlaylistId === null ||
      !editingPlaylistName.trim()
    ) {
      return;
    }

    setPlaylists((old) =>
      old.map((playlist) =>
        playlist.id ===
        editingPlaylistId
          ? {
              ...playlist,
              name:
                editingPlaylistName.trim(),
            }
          : playlist
      )
    );

    setEditingPlaylistId(null);
    setEditingPlaylistName("");
  };

  const addSongToPlaylist = (
    playlistId: number,
    songId: number
  ) => {
    setPlaylists((old) =>
      old.map((playlist) => {
        if (
          playlist.id !==
          playlistId
        ) {
          return playlist;
        }

        if (
          playlist.songIds.includes(
            songId
          )
        ) {
          return playlist;
        }

        return {
          ...playlist,
          songIds: [
            ...playlist.songIds,
            songId,
          ],
        };
      })
    );
  };

  const removeSongFromPlaylist = (
    playlistId: number,
    songId: number
  ) => {
    setPlaylists((old) =>
      old.map((playlist) =>
        playlist.id ===
        playlistId
          ? {
              ...playlist,
              songIds:
                playlist.songIds.filter(
                  (id) =>
                    id !== songId
                ),
            }
          : playlist
      )
    );
  };

  const playPlaylist = (
    playlist: Playlist
  ) => {
    const validSongIds =
      playlist.songIds.filter(
        (id) =>
          allSongs.some(
            (song) =>
              song.id === id
          )
      );

    if (
      validSongIds.length === 0
    ) {
      return;
    }

    setQueue(validSongIds);
    setIsQueueMode(true);

    const firstSong =
      allSongs.find(
        (song) =>
          song.id ===
          validSongIds[0]
      );

    if (firstSong) {
      setCurrentSong(firstSong);
      setIsPlaying(true);
    }
  };

  /* =========================================================
     CREATOR LOGIN
  ========================================================= */

  const handleCreatorLogin = () => {
    /*
      Temporary creator PIN.

      IMPORTANT:
      This is not secure because frontend code
      can be inspected.

      Later we should replace this with
      Supabase Authentication.
    */

    if (creatorPin === "2468") {
      setCreatorLoggedIn(true);
      setCreatorPin("");
      setLoginError("");
      setActivePage("Creator");
    } else {
      setLoginError(
        "Incorrect creator PIN."
      );
    }
  };

  const handleCreatorLogout = () => {
    setCreatorLoggedIn(false);
    setActivePage("Home");
  };

  /* =========================================================
     UPLOAD SONG TO SUPABASE
  ========================================================= */

  const handleAddSong = async () => {
    if (
      !newSongTitle.trim() ||
      !newArtist.trim() ||
      !audioFile ||
      !coverFile
    ) {
      alert(
        "Please fill all fields and select audio + cover."
      );
      return;
    }

    try {
      const safeAudioName =
        audioFile.name
          .replace(
            /[^a-zA-Z0-9.-]/g,
            "_"
          );

      const safeCoverName =
        coverFile.name
          .replace(
            /[^a-zA-Z0-9.-]/g,
            "_"
          );

      const uniqueId =
        `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 9)}`;

      const audioPath =
        `${uniqueId}-${safeAudioName}`;

      const coverPath =
        `${uniqueId}-${safeCoverName}`;

      /* -------------------------
         AUDIO UPLOAD
      ------------------------- */

      const {
        error: audioUploadError,
      } = await supabase.storage
        .from("audio")
        .upload(
          audioPath,
          audioFile,
          {
            cacheControl: "3600",
            upsert: false,
          }
        );

      if (audioUploadError) {
        throw audioUploadError;
      }

      /* -------------------------
         COVER UPLOAD
      ------------------------- */

      const {
        error: coverUploadError,
      } = await supabase.storage
        .from("covers")
        .upload(
          coverPath,
          coverFile,
          {
            cacheControl: "3600",
            upsert: false,
          }
        );

      if (coverUploadError) {
        throw coverUploadError;
      }

      /* -------------------------
         PUBLIC URLS
      ------------------------- */

      const {
        data: audioPublicData,
      } = supabase.storage
        .from("audio")
        .getPublicUrl(audioPath);

      const {
        data: coverPublicData,
      } = supabase.storage
        .from("covers")
        .getPublicUrl(coverPath);

      const audioUrl =
        audioPublicData.publicUrl;

      const coverUrl =
        coverPublicData.publicUrl;

      /* -------------------------
         DATABASE RECORD
      ------------------------- */

      const {
        data: insertedSong,
        error: databaseError,
      } = await supabase
        .from("songs")
        .insert({
          title:
            newSongTitle.trim(),
          artist:
            newArtist.trim(),
          language:
            newLanguage,
          audio_url:
            audioUrl,
          cover_url:
            coverUrl,
        })
        .select()
        .single();

      if (databaseError) {
        throw databaseError;
      }

      const newSong: Song = {
        id: Number(insertedSong.id),
        title:
          insertedSong.title,
        artist:
          insertedSong.artist,
        language:
          insertedSong.language,
        audio:
          insertedSong.audio_url,
        cover:
          insertedSong.cover_url,
        isLocal: true,
      };

      setAllSongs((old) => [
        ...old,
        newSong,
      ]);

      setNewSongTitle("");
      setNewArtist("");
      setNewLanguage("Telugu");
      setAudioFile(null);
      setCoverFile(null);

      const audioInput =
        document.getElementById(
          "audio-upload"
        ) as HTMLInputElement | null;

      const coverInput =
        document.getElementById(
          "cover-upload"
        ) as HTMLInputElement | null;

      if (audioInput) {
        audioInput.value = "";
      }

      if (coverInput) {
        coverInput.value = "";
      }

      alert(
        "Song uploaded successfully!"
      );
    } catch (error) {
      console.error(
        "Upload error:",
        error
      );

      alert(
        "Could not upload song. Check Supabase Storage and database policies."
      );
    }
  };

  /* =========================================================
     EDIT SONG
  ========================================================= */

  const startEditSong = (
    song: Song
  ) => {
    setEditingSongId(song.id);
    setEditTitle(song.title);
    setEditArtist(song.artist);
    setEditLanguage(
      song.language
    );
  };

  const cancelEditSong = () => {
    setEditingSongId(null);
    setEditTitle("");
    setEditArtist("");
    setEditLanguage("");
  };

  const saveSongEdit = async () => {
    if (
      editingSongId === null ||
      !editTitle.trim() ||
      !editArtist.trim()
    ) {
      return;
    }

    const id = editingSongId;

    const updatedSongData = {
      title:
        editTitle.trim(),
      artist:
        editArtist.trim(),
      language:
        editLanguage,
    };

    try {
      const {
        error,
      } = await supabase
        .from("songs")
        .update(
          updatedSongData
        )
        .eq("id", id);

      if (error) {
        throw error;
      }

      setAllSongs((oldSongs) =>
        oldSongs.map((song) =>
          song.id === id
            ? {
                ...song,
                ...updatedSongData,
              }
            : song
        )
      );

      if (
        currentSong?.id === id
      ) {
        setCurrentSong((old) =>
          old
            ? {
                ...old,
                ...updatedSongData,
              }
            : old
        );
      }

      cancelEditSong();
    } catch (error) {
      console.error(
        "Edit error:",
        error
      );

      alert(
        "Could not update song."
      );
    }
  };

  /* =========================================================
     DELETE SONG
  ========================================================= */

  const deleteSong = async (
    song: Song
  ) => {
    if (!song.isLocal) {
      alert(
        "Only creator-uploaded songs can be deleted."
      );
      return;
    }

    if (
      !window.confirm(
        `Delete "${song.title}" permanently?`
      )
    ) {
      return;
    }

    try {
      /*
        Delete database record first.
      */

      const {
        error: databaseError,
      } = await supabase
        .from("songs")
        .delete()
        .eq("id", song.id);

      if (databaseError) {
        throw databaseError;
      }

      /*
        Try to remove files from storage.

        This extracts the filename from the public URL.
      */

      try {
        const audioUrl =
          new URL(song.audio);

        const coverUrl =
          new URL(song.cover);

        const audioMarker =
          "/storage/v1/object/public/audio/";

        const coverMarker =
          "/storage/v1/object/public/covers/";

        const audioIndex =
          audioUrl.pathname.indexOf(
            audioMarker
          );

        const coverIndex =
          coverUrl.pathname.indexOf(
            coverMarker
          );

        if (audioIndex !== -1) {
          const audioPath =
            decodeURIComponent(
              audioUrl.pathname.substring(
                audioIndex +
                  audioMarker.length
              )
            );

          await supabase.storage
            .from("audio")
            .remove([
              audioPath,
            ]);
        }

        if (coverIndex !== -1) {
          const coverPath =
            decodeURIComponent(
              coverUrl.pathname.substring(
                coverIndex +
                  coverMarker.length
              )
            );

          await supabase.storage
            .from("covers")
            .remove([
              coverPath,
            ]);
        }
      } catch (storageError) {
        console.warn(
          "Storage cleanup failed:",
          storageError
        );
      }

      setAllSongs((old) =>
        old.filter(
          (item) =>
            item.id !== song.id
        )
      );

      setFavorites((old) =>
        old.filter(
          (id) =>
            id !== song.id
        )
      );

      setQueue((old) =>
        old.filter(
          (id) =>
            id !== song.id
        )
      );

      setPlaylists((old) =>
        old.map(
          (playlist) => ({
            ...playlist,
            songIds:
              playlist.songIds.filter(
                (id) =>
                  id !== song.id
              ),
          })
        )
      );

      if (
        currentSong?.id ===
        song.id
      ) {
        const replacement =
          allSongs.find(
            (item) =>
              item.id !== song.id
          );

        setCurrentSong(
          replacement || null
        );

        setIsPlaying(false);
      }

      alert(
        "Song deleted successfully."
      );
    } catch (error) {
      console.error(
        "Delete error:",
        error
      );

      alert(
        "Could not delete song."
      );
    }
  };

  /* =========================================================
     FILTERING
  ========================================================= */

  const filteredSongs =
    allSongs.filter((song) => {
      const matchesLanguage =
        selectedLanguage ===
          "All" ||
        song.language ===
          selectedLanguage;

      const searchText =
        search
          .toLowerCase()
          .trim();

      const matchesSearch =
        !searchText ||
        song.title
          .toLowerCase()
          .includes(
            searchText
          ) ||
        song.artist
          .toLowerCase()
          .includes(
            searchText
          ) ||
        song.language
          .toLowerCase()
          .includes(
            searchText
          );

      return (
        matchesLanguage &&
        matchesSearch
      );
    });

  const favoriteSongs =
    allSongs.filter((song) =>
      favorites.includes(
        song.id
      )
    );

  const selectedPlaylist =
    playlists.find(
      (playlist) =>
        playlist.id ===
        selectedPlaylistId
    );

  const queueSongs = queue
    .map((id) =>
      allSongs.find(
        (song) =>
          song.id === id
      )
    )
    .filter(Boolean) as Song[];

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const navItems = [
    {
      name: "Home",
      icon: "⌂",
    },
    {
      name: "Search",
      icon: "⌕",
    },
    {
      name: "Library",
      icon: "▣",
    },
    {
      name: "Queue",
      icon: "☷",
    },
    {
      name: "Favorites",
      icon: "♥",
    },
    {
      name: "Creator",
      icon: "♛",
    },
  ];

  /* =========================================================
     SONG GRID
  ========================================================= */

  const renderSongGrid = (
    songs: Song[]
  ) => {
    if (songs.length === 0) {
      return (
        <div className="empty-state">
          <div>🎵</div>

          <h3>
            No songs found
          </h3>

          <p>
            Try another search
            or language.
          </p>
        </div>
      );
    }

    return (
      <div className="song-grid">
        {songs.map((song) => (
          <SongCard
            key={song.id}
            song={song}
            onPlay={() =>
              playSong(song)
            }
            isPlaying={
              currentSong?.id ===
                song.id &&
              isPlaying
            }
            isFavorite={favorites.includes(
              song.id
            )}
            onFavorite={() =>
              toggleFavorite(
                song.id
              )
            }
            onAddToQueue={() =>
              addToQueue(song.id)
            }
            onPlayNext={() =>
              playNextInQueue(
                song.id
              )
            }
          />
        ))}
      </div>
    );
  };

  /* =========================================================
     HOME
  ========================================================= */

  const renderHome = () => (
    <>
      <section className="hero">
        <div className="hero-content">
          <p className="hero-small">
            WELCOME TO SWARAM
          </p>

          <h1>
            Music for
            <br />
            every language.
          </h1>

          <p>
            Discover and enjoy music
            in Telugu, Hindi,
            English, Tamil, Kannada
            and Malayalam.
          </p>
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <div>
            <p className="section-label">
              EXPLORE
            </p>

            <h2>
              Languages
            </h2>
          </div>
        </div>

        <div className="language-buttons">
          {languages.map(
            (language) => (
              <button
                key={language}
                className={
                  selectedLanguage ===
                  language
                    ? "language-btn active"
                    : "language-btn"
                }
                onClick={() =>
                  setSelectedLanguage(
                    language
                  )
                }
              >
                {language}
              </button>
            )
          )}
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <div>
            <p className="section-label">
              DISCOVER
            </p>

            <h2>
              All Songs
            </h2>

            <p>
              {filteredSongs.length}{" "}
              songs available
            </p>
          </div>
        </div>

        {renderSongGrid(
          filteredSongs
        )}
      </section>
    </>
  );

  /* =========================================================
     SEARCH
  ========================================================= */

  const renderSearch = () => (
    <section className="content-section page-top">
      <div className="section-heading">
        <div>
          <p className="section-label">
            SEARCH
          </p>

          <h1>
            Find your music
          </h1>

          <p>
            Search by song title,
            artist or language.
          </p>
        </div>
      </div>

      <div className="large-search">
        <span>⌕</span>

        <input
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          placeholder="Search songs, artists, languages..."
        />
      </div>

      {renderSongGrid(
        filteredSongs
      )}
    </section>
  );

  /* =========================================================
     LIBRARY
  ========================================================= */

  const renderLibrary = () => (
    <section className="content-section page-top">
      <div className="section-heading">
        <div>
          <p className="section-label">
            YOUR MUSIC
          </p>

          <h1>
            Library
          </h1>

          <p>
            Create and manage
            your playlists.
          </p>
        </div>
      </div>

      <div className="playlist-create">
        <input
          value={newPlaylistName}
          onChange={(e) =>
            setNewPlaylistName(
              e.target.value
            )
          }
          placeholder="New playlist name"
        />

        <button
          onClick={
            createPlaylist
          }
        >
          + Create Playlist
        </button>
      </div>

      {playlists.length ===
      0 ? (
        <div className="empty-state compact">
          <div>📋</div>

          <h3>
            No playlists yet
          </h3>

          <p>
            Create your first
            playlist above.
          </p>
        </div>
      ) : (
        <div className="playlist-grid">
          {playlists.map(
            (playlist) => (
              <div
                key={
                  playlist.id
                }
                className={
                  selectedPlaylistId ===
                  playlist.id
                    ? "playlist-card selected"
                    : "playlist-card"
                }
                onClick={() =>
                  setSelectedPlaylistId(
                    playlist.id
                  )
                }
              >
                <div className="playlist-icon">
                  ♫
                </div>

                <div>
                  {editingPlaylistId ===
                  playlist.id ? (
                    <input
                      className="playlist-edit-input"
                      value={
                        editingPlaylistName
                      }
                      onChange={(e) =>
                        setEditingPlaylistName(
                          e.target
                            .value
                        )
                      }
                      onClick={(e) =>
                        e.stopPropagation()
                      }
                    />
                  ) : (
                    <h3>
                      {
                        playlist.name
                      }
                    </h3>
                  )}

                  <p>
                    {
                      playlist
                        .songIds
                        .length
                    }{" "}
                    songs
                  </p>
                </div>

                <div className="playlist-actions">
                  {editingPlaylistId ===
                  playlist.id ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        savePlaylistRename();
                      }}
                    >
                      ✓
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();

                        setEditingPlaylistId(
                          playlist.id
                        );

                        setEditingPlaylistName(
                          playlist.name
                        );
                      }}
                    >
                      ✎
                    </button>
                  )}

                  <button
                    className="danger-button"
                    onClick={(e) => {
                      e.stopPropagation();

                      deletePlaylist(
                        playlist.id
                      );
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {selectedPlaylist && (
        <div className="playlist-detail">
          <div className="playlist-detail-header">
            <div>
              <p className="section-label">
                PLAYLIST
              </p>

              <h2>
                {
                  selectedPlaylist.name
                }
              </h2>

              <p>
                {
                  selectedPlaylist
                    .songIds.length
                }{" "}
                songs
              </p>
            </div>

            <button
              className="primary-button"
              onClick={() =>
                playPlaylist(
                  selectedPlaylist
                )
              }
            >
              ▶ Play Playlist
            </button>
          </div>

          {selectedPlaylist
            .songIds.length > 0 ? (
            <div className="playlist-song-list">
              {selectedPlaylist.songIds.map(
                (songId, index) => {
                  const song =
                    allSongs.find(
                      (item) =>
                        item.id ===
                        songId
                    );

                  if (!song) {
                    return null;
                  }

                  return (
                    <div
                      className="playlist-song"
                      key={
                        song.id
                      }
                    >
                      <span className="playlist-number">
                        {index +
                          1}
                      </span>

                      <img
                        src={
                          song.cover
                        }
                        alt={
                          song.title
                        }
                      />

                      <div>
                        <strong>
                          {
                            song.title
                          }
                        </strong>

                        <span>
                          {
                            song.artist
                          }
                        </span>
                      </div>

                      <button
                        onClick={() =>
                          playQueueSong(
                            song.id
                          )
                        }
                      >
                        ▶
                      </button>

                      <button
                        className="danger-button"
                        onClick={() =>
                          removeSongFromPlaylist(
                            selectedPlaylist.id,
                            song.id
                          )
                        }
                      >
                        ×
                      </button>
                    </div>
                  );
                }
              )}
            </div>
          ) : (
            <div className="empty-state compact">
              <p>
                This playlist is
                empty. Add songs
                below.
              </p>
            </div>
          )}

          <div className="add-playlist-songs">
            <h3>
              Add Songs
            </h3>

            <div className="playlist-add-grid">
              {allSongs.map(
                (song) => {
                  const alreadyAdded =
                    selectedPlaylist.songIds.includes(
                      song.id
                    );

                  return (
                    <div
                      className="playlist-add-item"
                      key={
                        song.id
                      }
                    >
                      <img
                        src={
                          song.cover
                        }
                        alt={
                          song.title
                        }
                      />

                      <div>
                        <strong>
                          {
                            song.title
                          }
                        </strong>

                        <span>
                          {
                            song.artist
                          }
                        </span>
                      </div>

                      <button
                        disabled={
                          alreadyAdded
                        }
                        onClick={() =>
                          addSongToPlaylist(
                            selectedPlaylist.id,
                            song.id
                          )
                        }
                      >
                        {alreadyAdded
                          ? "✓"
                          : "+"}
                      </button>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );

  /* =========================================================
     QUEUE
  ========================================================= */

  const renderQueue = () => (
    <section className="content-section page-top">
      <div className="queue-header">
        <div>
          <p className="section-label">
            PLAY QUEUE
          </p>

          <h1>
            Your Queue
            <span className="queue-count">
              {queue.length}
            </span>
          </h1>

          <p>
            Songs added here will
            play one after another.
          </p>
        </div>

        <div className="queue-header-actions">
          <button
            className="primary-button"
            disabled={
              queue.length === 0
            }
            onClick={
              playQueueNow
            }
          >
            ▶ Play Queue
          </button>

          <button
            className="secondary-button"
            disabled={
              queue.length === 0
            }
            onClick={
              clearQueue
            }
          >
            Clear Queue
          </button>
        </div>
      </div>

      {queueSongs.length ===
      0 ? (
        <div className="empty-state">
          <div className="empty-queue-icon">
            ☷
          </div>

          <h3>
            Your queue is empty
          </h3>

          <p>
            Press the{" "}
            <strong>+</strong>{" "}
            button on any song to
            add it to the queue.
          </p>

          <button
            className="primary-button"
            onClick={() =>
              setActivePage(
                "Home"
              )
            }
          >
            Browse Songs
          </button>
        </div>
      ) : (
        <div className="queue-list">
          {queueSongs.map(
            (song, index) => {
              const isCurrent =
                isQueueMode &&
                currentSong?.id ===
                  song.id;

              return (
                <div
                  className={
                    isCurrent
                      ? "queue-item current"
                      : "queue-item"
                  }
                  key={song.id}
                >
                  <div className="queue-number">
                    {isCurrent
                      ? "▶"
                      : index + 1}
                  </div>

                  <img
                    src={
                      song.cover
                    }
                    alt={
                      song.title
                    }
                  />

                  <div className="queue-song-info">
                    <h3>
                      {
                        song.title
                      }
                    </h3>

                    <p>
                      {
                        song.artist
                      }{" "}
                      •{" "}
                      {
                        song.language
                      }
                    </p>

                    {isCurrent && (
                      <span className="now-playing">
                        NOW PLAYING
                      </span>
                    )}
                  </div>

                  <div className="queue-actions">
                    <button
                      onClick={() =>
                        playQueueSong(
                          song.id
                        )
                      }
                      title="Play"
                    >
                      ▶
                    </button>

                    <button
                      disabled={
                        index ===
                        0
                      }
                      onClick={() =>
                        moveQueueItem(
                          index,
                          "up"
                        )
                      }
                      title="Move up"
                    >
                      ↑
                    </button>

                    <button
                      disabled={
                        index ===
                        queue.length -
                          1
                      }
                      onClick={() =>
                        moveQueueItem(
                          index,
                          "down"
                        )
                      }
                      title="Move down"
                    >
                      ↓
                    </button>

                    <button
                      className="remove-queue"
                      onClick={() =>
                        removeFromQueue(
                          song.id
                        )
                      }
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}
    </section>
  );

  /* =========================================================
     FAVORITES
  ========================================================= */

  const renderFavorites = () => (
    <section className="content-section page-top">
      <div className="section-heading">
        <div>
          <p className="section-label">
            YOUR MUSIC
          </p>

          <h1>
            Favorites
          </h1>

          <p>
            {favoriteSongs.length}{" "}
            favorite songs
          </p>
        </div>
      </div>

      {renderSongGrid(
        favoriteSongs
      )}
    </section>
  );

  /* =========================================================
     CREATOR
  ========================================================= */

  const renderCreator = () => {
    if (!creatorLoggedIn) {
      return (
        <section className="content-section page-top creator-login-page">
          <div className="creator-login-card">
            <div className="creator-lock">
              ♛
            </div>

            <p className="section-label">
              CREATOR ACCESS
            </p>

            <h1>
              Creator Login
            </h1>

            <p>
              Only the creator can
              add and manage songs.
            </p>

            <input
              type="password"
              value={creatorPin}
              onChange={(e) =>
                setCreatorPin(
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (
                  e.key ===
                  "Enter"
                ) {
                  handleCreatorLogin();
                }
              }}
              placeholder="Enter creator PIN"
            />

            {loginError && (
              <div className="login-error">
                {loginError}
              </div>
            )}

            <button
              className="primary-button full-button"
              onClick={
                handleCreatorLogin
              }
            >
              Login as Creator
            </button>
          </div>
        </section>
      );
    }

    return (
      <section className="content-section page-top">
        <div className="creator-header">
          <div>
            <p className="section-label">
              CREATOR MODE
            </p>

            <h1>
              Manage Music
            </h1>

            <p>
              Add, edit and delete
              songs from SWARAM.
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={
              handleCreatorLogout
            }
          >
            Logout
          </button>
        </div>

        <div className="creator-form">
          <h2>
            ＋ Add New Song
          </h2>

          <div className="form-grid">
            <div className="form-field">
              <label>
                Song Title
              </label>

              <input
                value={
                  newSongTitle
                }
                onChange={(e) =>
                  setNewSongTitle(
                    e.target
                      .value
                  )
                }
                placeholder="Enter song title"
              />
            </div>

            <div className="form-field">
              <label>
                Artist
              </label>

              <input
                value={
                  newArtist
                }
                onChange={(e) =>
                  setNewArtist(
                    e.target
                      .value
                  )
                }
                placeholder="Enter artist name"
              />
            </div>

            <div className="form-field">
              <label>
                Language
              </label>

              <select
                value={
                  newLanguage
                }
                onChange={(e) =>
                  setNewLanguage(
                    e.target
                      .value
                  )
                }
              >
                {languages
                  .filter(
                    (language) =>
                      language !==
                      "All"
                  )
                  .map(
                    (language) => (
                      <option
                        key={
                          language
                        }
                        value={
                          language
                        }
                      >
                        {
                          language
                        }
                      </option>
                    )
                  )}
              </select>
            </div>

            <div className="form-field">
              <label>
                Audio
              </label>

              <input
                id="audio-upload"
                type="file"
                accept="audio/*"
                onChange={(e) =>
                  setAudioFile(
                    e.target
                      .files?.[0] ||
                      null
                  )
                }
              />

              {audioFile && (
                <small>
                  {
                    audioFile.name
                  }
                </small>
              )}
            </div>

            <div className="form-field">
              <label>
                Cover Image
              </label>

              <input
                id="cover-upload"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setCoverFile(
                    e.target
                      .files?.[0] ||
                      null
                  )
                }
              />

              {coverFile && (
                <small>
                  {
                    coverFile.name
                  }
                </small>
              )}
            </div>
          </div>

          <button
            className="primary-button"
            onClick={
              handleAddSong
            }
          >
            Upload Song
          </button>
        </div>

        <div className="manage-section">
          <div className="section-heading">
            <div>
              <p className="section-label">
                CREATOR LIBRARY
              </p>

              <h2>
                Manage Songs
              </h2>
            </div>
          </div>

          <div className="manage-song-list">
            {allSongs.map(
              (song) => (
                <div
                  className="manage-song"
                  key={song.id}
                >
                  <img
                    src={
                      song.cover
                    }
                    alt={
                      song.title
                    }
                  />

                  {editingSongId ===
                  song.id ? (
                    <div className="edit-song-form">
                      <input
                        value={
                          editTitle
                        }
                        onChange={(
                          e
                        ) =>
                          setEditTitle(
                            e
                              .target
                              .value
                          )
                        }
                        placeholder="Song title"
                      />

                      <input
                        value={
                          editArtist
                        }
                        onChange={(
                          e
                        ) =>
                          setEditArtist(
                            e
                              .target
                              .value
                          )
                        }
                        placeholder="Artist"
                      />

                      <select
                        value={
                          editLanguage
                        }
                        onChange={(
                          e
                        ) =>
                          setEditLanguage(
                            e
                              .target
                              .value
                          )
                        }
                      >
                        {languages
                          .filter(
                            (
                              language
                            ) =>
                              language !==
                              "All"
                          )
                          .map(
                            (
                              language
                            ) => (
                              <option
                                key={
                                  language
                                }
                                value={
                                  language
                                }
                              >
                                {
                                  language
                                }
                              </option>
                            )
                          )}
                      </select>

                      <div className="edit-actions">
                        <button
                          className="primary-button"
                          onClick={
                            saveSongEdit
                          }
                        >
                          Save
                        </button>

                        <button
                          className="secondary-button"
                          onClick={
                            cancelEditSong
                          }
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="manage-song-info">
                        <h3>
                          {
                            song.title
                          }
                        </h3>

                        <p>
                          {
                            song.artist
                          }
                        </p>

                        <span>
                          {
                            song.language
                          }
                        </span>

                        {song.isLocal && (
                          <small>
                            Uploaded by
                            Creator
                          </small>
                        )}
                      </div>

                      <div className="manage-actions">
                        {song.isLocal && (
                          <>
                            <button
                              onClick={() =>
                                startEditSong(
                                  song
                                )
                              }
                            >
                              ✎ Edit
                            </button>

                            <button
                              className="danger-button"
                              onClick={() =>
                                deleteSong(
                                  song
                                )
                              }
                            >
                              🗑 Delete
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </section>
    );
  };

  /* =========================================================
     PAGE ROUTER
  ========================================================= */

  const renderPage = () => {
    switch (
      activePage
    ) {
      case "Search":
        return renderSearch();

      case "Library":
        return renderLibrary();

      case "Queue":
        return renderQueue();

      case "Favorites":
        return renderFavorites();

      case "Creator":
        return renderCreator();

      default:
        return renderHome();
    }
  };

  /* =========================================================
     MAIN UI
  ========================================================= */

  return (
    <div className="app">
      {/* SIDEBAR */}

      <aside className="sidebar">
        <div className="brand">
          <button
            className="brand-icon"
            onClick={
              handleLogoClick
            }
            aria-label="Go to home"
          >
            <img
              src="/music/swaram-logo.png"
              alt="SWARAM"
            />
          </button>

          <div>
            <h1>
              SWARAM
            </h1>

            <span>
              MUSIC
            </span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems
            .filter(
              (item) =>
                item.name !==
                  "Creator" ||
                creatorLoggedIn
            )
            .map((item) => (
              <button
                key={item.name}
                className={
                  activePage ===
                  item.name
                    ? "nav-item active"
                    : "nav-item"
                }
                onClick={() =>
                  setActivePage(
                    item.name
                  )
                }
              >
                <span>
                  {item.icon}
                </span>

                <strong>
                  {item.name}
                </strong>

                {item.name ===
                  "Queue" &&
                  queue.length >
                    0 && (
                    <em>
                      {
                        queue.length
                      }
                    </em>
                  )}
              </button>
            ))}
        </nav>

        <div className="sidebar-footer">
          <p>
            SWARAM MUSIC
          </p>

          <span>
            Your music. Your
            world.
          </span>
        </div>
      </aside>

      {/* MAIN */}

      <main className="main">
        <header className="topbar">
          <button
            className="mobile-logo"
            onClick={
              handleLogoClick
            }
            aria-label="Go to home"
          >
            <img
              src="/music/swaram-logo.png"
              alt="SWARAM"
            />
          </button>

          <div className="topbar-title">
            <span>
              {activePage}
            </span>
          </div>

          <div className="top-search">
            <span>⌕</span>

            <input
              value={search}
              onChange={(e) => {
                setSearch(
                  e.target.value
                );

                if (
                  e.target.value.trim()
                ) {
                  setActivePage(
                    "Search"
                  );
                }
              }}
              placeholder="Search songs, artists..."
            />
          </div>
        </header>

        <div className="page-content">
          {renderPage()}
        </div>
      </main>

      {/* AUDIO */}

      <audio
        ref={audioRef}
        preload="metadata"
        onTimeUpdate={
          handleTimeUpdate
        }
        onLoadedMetadata={
          handleLoadedMetadata
        }
        onEnded={
          handleSongEnded
        }
      />

      {/* MUSIC PLAYER */}

      {currentSong && (
        <div className="music-player">
          <div className="player-song">
            <img
              src={
                currentSong.cover
              }
              alt={
                currentSong.title
              }
              onError={(e) => {
                e.currentTarget.src =
                  "/music/default-cover.jpg";
              }}
            />

            <div>
              <h3>
                {
                  currentSong.title
                }
              </h3>

              <p>
                {
                  currentSong.artist
                }
              </p>
            </div>

            <button
              className={
                favorites.includes(
                  currentSong.id
                )
                  ? "player-favorite active"
                  : "player-favorite"
              }
              onClick={() =>
                toggleFavorite(
                  currentSong.id
                )
              }
            >
              {favorites.includes(
                currentSong.id
              )
                ? "♥"
                : "♡"}
            </button>
          </div>

          <div className="player-center">
            <div className="player-controls">
              <button
                onClick={
                  playPrevious
                }
                title="Previous"
              >
                ⏮
              </button>

              <button
                className="main-play"
                onClick={
                  togglePlay
                }
                title={
                  isPlaying
                    ? "Pause"
                    : "Play"
                }
              >
                {isPlaying
                  ? "❚❚"
                  : "▶"}
              </button>

              <button
                onClick={
                  playNext
                }
                title="Next"
              >
                ⏭
              </button>
            </div>

            <div className="progress-area">
              <span>
                {formatTime(
                  currentTime
                )}
              </span>

              <input
                type="range"
                min="0"
                max={
                  duration || 0
                }
                step="0.1"
                value={
                  currentTime
                }
                onChange={
                  handleSeek
                }
              />

              <span>
                {formatTime(
                  duration
                )}
              </span>
            </div>
          </div>

          <div className="player-right">
            <button
              onClick={
                toggleMute
              }
              title="Mute"
            >
              {isMuted ||
              volume === 0
                ? "🔇"
                : "🔊"}
            </button>

            <input
              className="volume-slider"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={
                isMuted
                  ? 0
                  : volume
              }
              onChange={
                handleVolumeChange
              }
            />

            <button
              className={
                isQueueMode
                  ? "queue-player-btn active"
                  : "queue-player-btn"
              }
              onClick={() =>
                setActivePage(
                  "Queue"
                )
              }
              title="Queue"
            >
              ☷

              {queue.length >
                0 && (
                <span>
                  {
                    queue.length
                  }
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* MOBILE NAV */}

      <nav className="mobile-nav">
        {navItems
          .filter(
            (item) =>
              item.name !==
                "Creator" ||
              creatorLoggedIn
          )
          .map((item) => (
            <button
              key={item.name}
              className={
                activePage ===
                item.name
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActivePage(
                  item.name
                )
              }
            >
              <span>
                {item.icon}
              </span>

              <small>
                {item.name}
              </small>

              {item.name ===
                "Queue" &&
                queue.length >
                  0 && (
                  <em>
                    {
                      queue.length
                    }
                  </em>
                )}
            </button>
          ))}
      </nav>
    </div>
  );
}

export default App;